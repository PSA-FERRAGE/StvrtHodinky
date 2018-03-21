<?php

namespace App\Entity\Fer;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="dopravnik")
 */
class Dopravnik
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
     * @ORM\ManyToOne(targetEntity="App\Entity\Fer\Linka", inversedBy="dopravniky")
     * @ORM\JoinColumn(name="linka_id", referencedColumnName="id", nullable=false)
     *
     * @var Linka
     */
    private $linka;

    /**
     * @ORM\Column(type="string")
     *
     * @var string
     */
    private $nazov;

    /**
     * @ORM\Column(type="integer")
     *
     * @var integer
     */
    private $min_cnt;

    /**
     * @ORM\Column(type="integer")
     *
     * @var integer
     */
    private $ok_cnt;

    /**
     * @ORM\Column(type="integer")
     *
     * @var integer
     */
    private $max;

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
     * Get linka
     *
     * @return Linka
     */
    public function getLinka(): Linka
    {
        return $this->linka;
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
     * Get min_cnt
     *
     * @return int
     */
    public function getMinCnt(): int
    {
        return $this->min_cnt;
    }

    /**
     * Get ok_cnt
     *
     * @return int
     */
    public function getOkCnt(): int
    {
        return $this->ok_cnt;
    }

    /**
     * Get max
     *
     * @return int
     */
    public function getMax(): int
    {
        return $this->max;
    }
}
