<?php

namespace App\Controller;

use App\Entity\Fer\Dopravnik;
use App\Entity\Fer\Linka;
use App\Entity\Sapia\SSCQT05;
use App\Entity\Sapia\SSCQT09;
use DateInterval;
use DatePeriod;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class RaportController extends Controller
{
    /**
     * @Route(path="/analyse/{linka}", methods={"POST"}, name="analyse_action")
     *
     * @param Request $request
     * @param Linka   $linka
     *
     * @return JsonResponse
     * @throws \Exception
     */
    public function analyseAction(Request $request, Linka $linka)
    {
        $params = $request->request;

        $trojzmenka = $params->has('stvorzmenka') ? false : true;
        $datum      = $params->get('datum', null);
        $zmeny      = explode(",", $params->get('zmeny', ""));

        if ($datum == null || empty($zmeny)) {
            return new JsonResponse([], Response::HTTP_BAD_REQUEST);
        }

        $timeIntervals = $this->getTimeIntervals($zmeny, $datum, $trojzmenka);

        $result = [];
        foreach ($timeIntervals as $timeInterval) {
            $tmpResult = [
                'linka'        => $linka->getNazov(),
                'zmena'        => $timeInterval['zmena'],
                'zmenaString'  => $timeInterval['zmenaString'],
                'Stvrthodinky' => $this->getStvrthodinky($linka, $timeInterval),
                'Dopravniky'   => $this->getDopravnikData($linka, $timeInterval),
            ];

            if (empty($tmpResult['Stvrthodinky'])) {
                $tmpResult['produkcia']        = 0;
                $tmpResult['stvrthodinky']     = 0;
                $tmpResult['stvrthodinkyPerc'] = 0;
            } else {
                $tmpResult['produkcia']        = array_sum($tmpResult['Stvrthodinky']['values']);
                $tmpResult['stvrthodinky']     = array_reduce(
                        $tmpResult['Stvrthodinky']['values'],
                        function ($a, $b) use ($linka) {
                            return ($b >= $linka->getLimitStvrthodinky()) ? ++$a : $a;
                        }
                    ) ?? 0;
                $tmpResult['stvrthodinkyPerc'] = round(
                    ($tmpResult['stvrthodinky'] / count($tmpResult['Stvrthodinky']['values'])) * 100,
                    1
                );
            }

            $result[] = $tmpResult;
        }

        return new JsonResponse($result);
    }

    /**
     * @param array  $zmeny
     * @param string $datum
     * @param bool   $trojzmenka
     *
     * @return array
     */
    private function getTimeIntervals(array $zmeny, string $datum, bool $trojzmenka): array
    {
        return array_map(
            function ($elem) use ($trojzmenka, $datum) {
                $start = \DateTime::createFromFormat('d/m/Y H:i', $datum." 00:00");
                $end   = \DateTime::createFromFormat('d/m/Y H:i', $datum." 00:00");

                switch ($elem) {
                    case "R":
                        return [
                            'zmena'       => $elem,
                            'zmenaString' => "Ranná zmena",
                            'start'       => $start->add(new DateInterval('PT6H')),
                            'end'         => $end->add(new DateInterval(($trojzmenka ? "PT14H" : "PT18H"))),
                        ];
                    case "P":
                        return [
                            'zmena'       => $elem,
                            'zmenaString' => "Poobedná zmena",
                            'start'       => $start->add(new DateInterval('PT14H')),
                            'end'         => $end->add(new DateInterval(($trojzmenka ? "PT22H" : "P1DT2H"))),
                        ];
                    case "N":
                        return [
                            'zmena'       => $elem,
                            'zmenaString' => "Nočná zmena",
                            'start'       => $start->add(new DateInterval(($trojzmenka ? "PT22H" : "PT18H"))),
                            'end'         => $end->add(new DateInterval('P1DT6H')),
                        ];
                    default:
                        return [];
                }
            },
            $zmeny
        );
    }

    /**
     * @param Linka $linka
     * @param array $timeInterval
     *
     * @return array
     * @throws \Exception
     */
    private function getDopravnikData(Linka $linka, array $timeInterval): array
    {
        $result = [];

        $dopravniky = $linka->getDopravniky();
        $sapiaEm    = $this->getDoctrine()->getManager('sapia');

        /** @var Dopravnik $dopravnik */
        foreach ($dopravniky as $dopravnik) {
            $data = $sapiaEm->getRepository(SSCQT09::class)
                            ->findAllConvDataBetweenDates(
                                $timeInterval['start'],
                                $timeInterval['end'],
                                $dopravnik->getNazov()
                            );

            if ($data) {
                $result[] = $this->computeDopravnikResult($dopravnik, $timeInterval, $data);
            }
        }

        return $result;
    }

    /**
     * @param Dopravnik $dopravnik
     * @param array     $timeInterval
     * @param array     $data
     *
     * @return array
     * @throws \Exception
     */
    private function computeDopravnikResult(Dopravnik $dopravnik, array $timeInterval, array $data): array
    {
        $interval = new DateInterval('PT1M');
        $tmpEnd   = clone $timeInterval['end'];
        $period   = new DatePeriod($timeInterval['start'], $interval, $tmpEnd->add($interval));
        $values   = [];
        $labels   = [];

        $i      = 0;
        $lasVal = 0;

        /** @var \DateTime $dt */
        foreach ($period as $dt) {
            $labels[]   = $dt->format('Y-m-d H:i');
            $values[$i] = -1;

            /** @var SSCQT09 $zaznam */
            foreach ($data as $zaznam) {
                $tmpDateTime = new \DateTime($zaznam->getDEBEVT()->format('Y-m-d H:i'));

                if ($dt == $tmpDateTime) {
                    $lasVal = $zaznam->getVALCPT();
                } else {
                    if ($dt < $tmpDateTime) {
                        break;
                    }
                }
            }

            $values[$i] = $lasVal;
            $i++;
        }

        return [
            'nazov'       => $dopravnik->getNazov(),
            'values'      => $values,
            'labels'      => $labels,
            'minVals'     => array_fill(0, count($values), $dopravnik->getMinCnt()),
            'okVals'      => array_fill(0, count($values), $dopravnik->getOkCnt()),
            'min'         => min($values),
            'max'         => max($values),
            'MaximumAxis' => $dopravnik->getMax(),
        ];
    }

    /**
     * @param Linka $linka
     * @param array $timeInterval
     *
     * @return array|null
     * @throws \Exception
     */
    private function getStvrthodinky(Linka $linka, array $timeInterval): ?array
    {
        $pocitadla    = $linka->getPocitadla();
        $localisation = $linka->getIdLoc();
        $sapiaEm      = $this->getDoctrine()->getManager('sapia');

        $data = $localisation == null
            ? $sapiaEm->getRepository(SSCQT09::class)
                      ->findAllStvrtHodDataBetweenDates($timeInterval['start'], $timeInterval['end'], $pocitadla)
            : $sapiaEm->getRepository(SSCQT05::class)
                      ->findAllStvrtHodDataBetweenDates(
                          $timeInterval['start'],
                          $timeInterval['end'],
                          $pocitadla,
                          $localisation
                      );

        if (empty($data)) {
            return null;
        }

        return $this->extractStvrthodinky($linka, $timeInterval, $data);
    }

    /**
     * @param Linka $linka
     * @param array $timeInterval
     * @param array $data
     *
     * @return array
     * @throws \Exception
     */
    private function extractStvrthodinky(Linka $linka, array $timeInterval, array $data): array
    {
        $interval = new DateInterval('PT15M');
        $period   = new DatePeriod($timeInterval['start'], $interval, $timeInterval['end']);
        $values   = [];
        $labels   = [];

        /** @var \DateTime $dt */
        foreach ($period as $dt) {
            $labels[]   = $dt->format('Y-m-d H:i');
            $cnt        = 0;
            $secondTime = clone $dt;
            $secondTime->add(new DateInterval('PT15M'));

            foreach ($data as $zaznam) {
                $tmpDateTime = new \DateTime($zaznam->getTime()->format('Y-m-d H:i:s'));

                if ($tmpDateTime >= $dt && $tmpDateTime < $secondTime) {
                    $cnt += 1;
                } else {
                    if ($tmpDateTime >= $secondTime) {
                        break;
                    }
                }
            }

            $values[] = $cnt;
        }

        return [
            'values' => $values,
            'labels' => $labels,
            'limit'  => array_fill(0, count($values), $linka->getLimitStvrthodinky()),
            'max'    => max($values),
        ];
    }
}
