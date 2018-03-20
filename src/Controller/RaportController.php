<?php

namespace App\Controller;

use App\Entity\Fer\Dopravnik;
use App\Entity\Fer\Linka;
use App\Entity\Sapia\SSCQT09;
use DateInterval;
use DatePeriod;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class RaportController extends Controller
{
    /**
     * @Route(path="/dopravnik/{linka}", name="dopravnik_action")
     *
     * @param Request $request
     * @param Linka   $linka
     *
     * @return JsonResponse
     */
    public function getDopravnikDataAction(Request $request, Linka $linka)
    {
        $result = ['success' => false, 'msg' => ''];

        $sapiaEm = $this->getDoctrine()->getManager('sapia');

        $params = $request->request;
        $start  = \DateTime::createFromFormat('d/m/Y H:i', $params->get('start', null));
        $end    = \DateTime::createFromFormat('d/m/Y H:i', $params->get('end', null));

        if (!$start || !$end) {
            $result['msg'] = 'Zle zadany datum!';

            return new JsonResponse($result);
        } else {
            if (!$linka) {
                $result['msg'] = 'Zle zadana linka!';

                return new JsonResponse($result);
            }
        }

        $dopravniky = $linka->getDopravniky();

        $result['linka']      = $linka->getNazov();
        $result['start']      = $start;
        $result['end']        = $end;
        $result['Dopravniky'] = [];


        /** @var Dopravnik $dopravnik */
        foreach ($dopravniky as $dopravnik) {
            $tmpRes = [
                'nazov' => $dopravnik->getNazov(),
            ];

            $data = $sapiaEm->getRepository(SSCQT09::class)
                            ->findAllConvDataBetweenDates($start, $end, $dopravnik->getNazov());

            if ($data) {
                $resVals                = $this->fillEmtpyTimeValues($start, $end, $data);
                $tmpRes['data']         = $resVals;
                $tmpRes['minVals']      = array_fill(0, count($resVals['values']), $dopravnik->getMinCnt());
                $tmpRes['okVals']       = array_fill(0, count($resVals['values']), $dopravnik->getOkCnt());
                $tmpRes['Maximum']      = max($resVals['values']);
                $result['Dopravniky'][] = $tmpRes;
            }
        }

        $result['success'] = true;

        return new JsonResponse($result);
    }

    private function fillEmtpyTimeValues(\DateTime $start, \DateTime $end, array $data): array
    {
        $interval = new DateInterval('PT1M');
        $tmpEnd   = clone $end;
        $period   = new DatePeriod($start, $interval, $tmpEnd->add($interval));
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

        return ['labels' => $labels, 'values' => $values];
    }

    /**
     * @Route(path="/stvrthodinky/{linka}")
     *
     * @param Request $request
     * @param Linka   $linka
     *
     * @return JsonResponse
     */
    public function getStvrthodinkyDataAction(Request $request, Linka $linka)
    {
        $result = ['success' => false, 'msg' => ''];

        $sapiaEm = $this->getDoctrine()->getManager('sapia');

        $params = $request->request;
        $start  = \DateTime::createFromFormat('d/m/Y H:i', $params->get('start', null));
        $end    = \DateTime::createFromFormat('d/m/Y H:i', $params->get('end', null));

        if (!$start || !$end) {
            $result['msg'] = 'Zle zadany datum!';

            return new JsonResponse($result);
        } else {
            if (!$linka) {
                $result['msg'] = 'Zle zadana linka!';

                return new JsonResponse($result);
            }
        }

        $pocitadla = $linka->getPocitadla();
        $data      = $sapiaEm->getRepository(SSCQT09::class)
                             ->findAllStvrtHodDataBetweenDates($start, $end, $pocitadla);
        $resData   = $this->extractStvrthodinky($start, $end, $data);

        $result['nazov']           = $linka->getNazov();
        $result['data']            = $resData;
        $result['data']['limit']   = array_fill(0, count($resData['values']), $linka->getLimitStvrthodinky());
        $result['data']['Maximum'] = max($resData['values']);
        $result['success']         = true;

        return new JsonResponse($result);
    }

    private function extractStvrthodinky(\DateTime $start, \DateTime $end, array $data): array
    {
        $interval = new DateInterval('PT15M');
        $period   = new DatePeriod($start, $interval, $end);
        $values   = [];
        $labels   = [];

        /** @var \DateTime $dt */
        foreach ($period as $dt) {
            $labels[]   = $dt->format('Y-m-d H:i');
            $cnt        = 0;
            $secondTime = clone $dt;
            $secondTime->add(new DateInterval('PT15M'));

            /** @var SSCQT09 $zaznam */
            foreach ($data as $zaznam) {
                $tmpDateTime = new \DateTime($zaznam->getDEBEVT()->format('Y-m-d H:i:s'));

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

        return ['labels' => $labels, 'values' => $values];
    }
}
