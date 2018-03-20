<?php

namespace App\Controller;

use App\Entity\Fer\Dopravnik;
use App\Entity\Sapia\SSCQT09;
use DateInterval;
use DatePeriod;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class DopravnikController extends Controller
{
    /**
     * @Route(path="/dopravnik/{linka}", name="dopravnik_action")
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function getDataAction(Request $request, $linka)
    {
        $result = ['success' => false, 'msg' => ''];

        $sapiaEm = $this->getDoctrine()->getManager();
        $ferEm   = $this->getDoctrine()->getManager('fer');

        $params = $request->request;
        $start  = \DateTime::createFromFormat('d/m/Y H:i', $params->get('start', null));
        $end    = \DateTime::createFromFormat('d/m/Y H:i', $params->get('end', null));

        $linka = $ferEm->getRepository('Fer:Linka')->find($linka);

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
                            ->findAllBetweenDates($start, $end, $dopravnik->getNazov());

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
}
