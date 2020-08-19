<?php

namespace App\Controller;

use App\Entity\Fer\Linka;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class ExportController extends AbstractController
{
    /**
     * @Route(path="/export/{linka}", methods={"POST"}, name="export_action")
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
