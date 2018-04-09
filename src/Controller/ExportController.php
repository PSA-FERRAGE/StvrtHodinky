<?php

namespace App\Controller;

use App\Entity\Fer\Linka;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class ExportController
{
    /**
     * @Route(path="/export/{linka}", name="export_action")
     * @Method("POST")
     *
     * @param Request $request
     * @param Linka   $linka
     *
     * @return JsonResponse $response
     */
    public function exportAction(Request $request, Linka $linka)
    {
        if (!$linka || !$data) {
            return new JsonResponse(['success' => false], 400);
        }

        $params = $request->request;
        $dataIt = $params->getIterator();

        foreach ($dataIt as $key => $value) {
            if ($value['type'] === 'stvrthodinky') {

            } else {

            }
        }

        return new JsonResponse(['success' => true]);
    }
}
