<?php

namespace App\Entity\Sapia;

use App\Type\MyDateTime;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\Sapia\SSCQT09Repository")
 * @ORM\Table(name="SSC99_M1.SSCQT09")
 */
class SSCQT09
{
    /**
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
    private $DEB_EVT;

    /**
     * @ORM\Column(type="integer", nullable=true)
     *
     * @var integer
     */
    private $VAL_CPT;

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
     * Get DEB_EVT
     *
     * @return MyDateTime
     */
    public function getDEBEVT(): MyDateTime
    {
        return $this->DEB_EVT;
    }

    /**
     * Get VAL_CPT
     *
     * @return int
     */
    public function getVALCPT(): int
    {
        return $this->VAL_CPT;
    }
}
