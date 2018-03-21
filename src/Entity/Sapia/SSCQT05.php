<?php

namespace App\Entity\Sapia;

use App\Type\MyDateTime;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\Sapia\SSCQT05Repository")
 * @ORM\Table(name="SSC99_M1.SSCQT05")
 */
class SSCQT05
{
    /**
     * @ORM\Id()
     * @ORM\Column(type="string", length=20)
     *
     * @var string
     */
    private $ID_LOC;

    /**
     * @ORM\Id()
     * @ORM\Column(type="string", length=10)
     *
     * @var string
     */
    private $ID_MNEMO;

    /**
     * @ORM\Id()
     * @ORM\Column(type="mydatetime", nullable=true)
     *
     * @var MyDateTime
     */
    private $FIN_EVT;

    /**
     * Get ID_LOC
     *
     * @return string
     */
    public function getIDLOC(): string
    {
        return $this->ID_LOC;
    }

    /**
     * Get ID_MNEMO
     *
     * @return string
     */
    public function getIDMNEMO(): string
    {
        return $this->ID_MNEMO;
    }

    /**
     * Get FIN_EVT
     *
     * @return MyDateTime
     */
    public function getFINEVT(): MyDateTime
    {
        return $this->FIN_EVT;
    }

    /**
     * @return MyDateTime
     */
    public function getTime(): MyDateTime
    {
        return $this->FIN_EVT;
    }
}
