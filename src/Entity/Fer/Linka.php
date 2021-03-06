<?php

namespace App\Entity\Fer;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="linka")
 */
class Linka
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     * @ORM\Column(type="integer", options={"unsigned":true})
     *
     * @var integer
     */
    private $id;

    /**
     * @ORM\Column(type="string")
     *
     * @var string
     */
    private $nazov;

    /**
     * @ORM\Column(type="simple_array")
     *
     * @var array
     */
    private $pocitadla;

    /**
     * @ORM\Column(type="integer")
     *
     * @var integer
     */
    private $limit_stvrthodinky;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Fer\Dopravnik", mappedBy="linka")
     *
     * @var ArrayCollection
     */
    private $dopravniky;

    /**
     * @ORM\Column(type="string", nullable=true)
     *
     * @var string
     */
    private $id_loc;

    public function __construct()
    {
        $this->dopravniky = new ArrayCollection();
    }

    /**
     * Get id
     *
     * @return int
     */
    public function getId(): int
    {
        return $this->id;
    }

    /**
     * Get nazov
     *
     * @return string
     */
    public function getNazov(): string
    {
        return $this->nazov;
    }

    /**
     * Get dopravniky
     *
     * @return Collection
     */
    public function getDopravniky(): Collection
    {
        return $this->dopravniky;
    }

    /**
     * Get pocitadla
     *
     * @return array
     */
    public function getPocitadla(): array
    {
        return $this->pocitadla;
    }

    /**
     * Get limit_stvrthodinky
     *
     * @return int
     */
    public function getLimitStvrthodinky(): int
    {
        return $this->limit_stvrthodinky;
    }

    /**
     * Get id_loc
     *
     * @return string|null
     */
    public function getIdLoc(): ?string
    {
        return $this->id_loc;
    }
}
