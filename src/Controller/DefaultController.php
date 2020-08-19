<?php

namespace App\Controller;

use App\Entity\Fer\Linka;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class DefaultController extends AbstractController
{
    /**
     * @Route(path="/")
     * @Route(path="/stvrthodinky", methods={"POST"}, name="index_action")
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function indexAction(EntityManagerInterface $em)
    {
        $linky = $em->getRepository(Linka::class)->findAll();

        return $this->render('default/default.html.twig', ['linky' => $linky]);
    }
}
