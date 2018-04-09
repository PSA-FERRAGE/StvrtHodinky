<?php

namespace App\Entity\Fer;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="export_stvrthodinky")
 */
class ExportStvrthodinky
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
     * @ORM\Column(type="string", length=50)
     *
     * @var string
     */
    private $exportId;

    /**
     * @ORM\Column(type="string", length=50)
     *
     * @var string
     */
    private $line;

    /**
     * @ORM\Column(type="string", length=50)
     *
     * @var string
     */
    private $shift;

    /**
     * @ORM\Column(type="string")
     *
     * @var string
     */
    private $labels;

    /**
     * @ORM\Column(type="string")
     *
     * @var string
     */
    private $vals;

    /**
     * @ORM\Column(type="string")
     *
     * @var string
     */
    private $limits;

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
     * Get exportId
     *
     * @return string
     */
    public function getExportId(): string
    {
        return $this->exportId;
    }

    /**
     * Get line
     *
     * @return string
     */
    public function getLine(): string
    {
        return $this->line;
    }

    /**
     * Get shift
     *
     * @return string
     */
    public function getShift(): string
    {
        return $this->shift;
    }

    /**
     * Get labels
     *
     * @return string
     */
    public function getLabels(): string
    {
        return $this->labels;
    }

    /**
     * Get vals
     *
     * @return string
     */
    public function getVals(): string
    {
        return $this->vals;
    }

    /**
     * Get limits
     *
     * @return string
     */
    public function getLimits(): string
    {
        return $this->limits;
    }

    /**
     * Set exportId
     *
     * @param string $exportId
     *
     * @return ExportStvrthodinky
     */
    public function setExportId(string $exportId)
    {
        $this->exportId = $exportId;

        return $this;
    }

    /**
     * Set line
     *
     * @param string $line
     *
     * @return ExportStvrthodinky
     */
    public function setLine(string $line)
    {
        $this->line = $line;

        return $this;
    }

    /**
     * Set shift
     *
     * @param string $shift
     *
     * @return ExportStvrthodinky
     */
    public function setShift(string $shift)
    {
        $this->shift = $shift;

        return $this;
    }

    /**
     * Set labels
     *
     * @param string $labels
     *
     * @return ExportStvrthodinky
     */
    public function setLabels(string $labels)
    {
        $this->labels = $labels;

        return $this;
    }

    /**
     * Set vals
     *
     * @param string $vals
     *
     * @return ExportStvrthodinky
     */
    public function setVals(string $vals)
    {
        $this->vals = $vals;

        return $this;
    }

    /**
     * Set limits
     *
     * @param string $limits
     *
     * @return ExportStvrthodinky
     */
    public function setLimits(string $limits)
    {
        $this->limits = $limits;

        return $this;
    }
}
