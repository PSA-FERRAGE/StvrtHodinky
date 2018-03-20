<?php

namespace App\Controller;

use App\Entity\Fer\Linka;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    /**
     * @Route(path="/", name="index_action")
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function indexAction()
    {
        $ferEm = $this->getDoctrine()->getManager('fer');
        $linky = $ferEm->getRepository(Linka::class)->findAll();

        return $this->render('default/default.html.twig', ['linky' => $linky]);
    }
}
