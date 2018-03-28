<?php

namespace App\Controller;

use App\Entity\Fer\Linka;
use Doctrine\ORM\EntityManagerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    /**
     * @Route(path="/")
     * @Route(path="/stvrthodinky", name="index_action")
     * @Method("GET")
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function indexAction(EntityManagerInterface $em)
    {
        $linky = $em->getRepository(Linka::class)->findAll();

        return $this->render('default/default.html.twig', ['linky' => $linky]);
    }
}
