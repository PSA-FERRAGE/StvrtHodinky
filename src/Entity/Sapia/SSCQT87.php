<?php

namespace App\Entity\Sapia;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="SSC99_M1.SSCQT87")
 */
class SSCQT87
{
    /**
     * @ORM\Id()
     * @ORM\Column(type="string")
     */
    private $GR_CLAS;

    /**
     * @ORM\Column(type="string")
     */
    private $DES_GR_CLAS;

    /**
     * @ORM\Column(type="string")
     */
    private $ID_TYP_ART;

    /**
     * @ORM\Column(type="integer")
     */
    private $TYPE_ALGO;

    /**
     * @ORM\Column(type="integer")
     */
    private $SEUIL;

    /**
     * @ORM\Column(type="integer")
     */
    private $PRIORITE;

    /**
     * @ORM\Column(type="integer")
     */
    private $SUIVI;

    /**
     * @ORM\Column(type="string")
     */
    private $FAM_PERTE;

    /**
     * Get GR_CLAS
     *
     * @return mixed
     */
    public function getGRCLAS()
    {
        return $this->GR_CLAS;
    }

    /**
     * Get DES_GR_CLAS
     *
     * @return mixed
     */
    public function getDESGRCLAS()
    {
        return $this->DES_GR_CLAS;
    }

    /**
     * Get ID_TYP_ART
     *
     * @return mixed
     */
    public function getIDTYPART()
    {
        return $this->ID_TYP_ART;
    }

    /**
     * Get TYPE_ALGO
     *
     * @return mixed
     */
    public function getTYPEALGO()
    {
        return $this->TYPE_ALGO;
    }

    /**
     * Get SEUIL
     *
     * @return mixed
     */
    public function getSEUIL()
    {
        return $this->SEUIL;
    }

    /**
     * Get PRIORITE
     *
     * @return mixed
     */
    public function getPRIORITE()
    {
        return $this->PRIORITE;
    }

    /**
     * Get SUIVI
     *
     * @return mixed
     */
    public function getSUIVI()
    {
        return $this->SUIVI;
    }

    /**
     * Get FAM_PERTE
     *
     * @return mixed
     */
    public function getFAMPERTE()
    {
        return $this->FAM_PERTE;
    }
}
