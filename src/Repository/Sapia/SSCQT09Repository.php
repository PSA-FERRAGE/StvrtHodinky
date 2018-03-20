<?php

namespace App\Repository\Sapia;

use App\Entity\Sapia\SSCQT09;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\Query\ResultSetMapping;
use Doctrine\ORM\Query\ResultSetMappingBuilder;
use Symfony\Bridge\Doctrine\RegistryInterface;

/**
 * @method SSCQT09|null find($id, $lockMode = null, $lockVersion = null)
 * @method SSCQT09|null findOneBy(array $criteria, array $orderBy = null)
 * @method SSCQT09[]    findAll()
 * @method SSCQT09[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class SSCQT09Repository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, SSCQT09::class);
    }


    public function findAllConvDataBetweenDates(\DateTime $start, \DateTime $end, $dopravniky): array
    {
        $rsm = new ResultSetMapping;
        $rsm->addEntityResult(SSCQT09::class, 't');
        $rsm->addFieldResult('t', 'ID_LOC', 'ID_LOC');
        $rsm->addFieldResult('t', 'ID_MNEMO', 'ID_MNEMO');
        $rsm->addFieldResult('t', 'DEB_EVT', 'DEB_EVT');
        $rsm->addFieldResult('t', 'VAL_CPT', 'VAL_CPT');

        $sql = 'SELECT ID_LOC, ID_MNEMO, TO_CHAR(DEB_EVT, \'YYYY-MM-DD HH24:MI:SS\') AS DEB_EVT,VAL_CPT
                FROM SSC99_M1.SSCQT09
                WHERE ID_MNEMO = :mnemo AND
                (DEB_EVT >= TO_DATE(:start, \'YYYY-MM-DD HH24:MI:SS\') AND DEB_EVT <= TO_DATE(:end, \'YYYY-MM-DD HH24:MI:SS\'))
                ORDER BY DEB_EVT ASC
        ';

        $query = $this->getEntityManager()->createNativeQuery($sql, $rsm);
        $data  = $query->execute(
            [
                'mnemo' => $dopravniky,
                'start' => $start->format('Y-m-d H:i:s'),
                'end'   => $end->format('Y-m-d H:i:s'),
            ],
            AbstractQuery::HYDRATE_OBJECT
        );

        return $data;
    }

    public function findAllStvrtHodDataBetweenDates(\DateTime $start, \DateTime $end, $pocitadla): array
    {
        $rsm = new ResultSetMapping;
        $rsm->addEntityResult(SSCQT09::class, 't');
        $rsm->addFieldResult('t', 'ID_LOC', 'ID_LOC');
        $rsm->addFieldResult('t', 'ID_MNEMO', 'ID_MNEMO');
        $rsm->addFieldResult('t', 'DEB_EVT', 'DEB_EVT');
        $rsm->addFieldResult('t', 'VAL_CPT', 'VAL_CPT');

        $sql = 'SELECT ID_LOC, ID_MNEMO, TO_CHAR(DEB_EVT, \'YYYY-MM-DD HH24:MI:SS\') AS DEB_EVT,VAL_CPT
                FROM SSC99_M1.SSCQT09
                WHERE ID_MNEMO IN (:mnemo) AND
                (DEB_EVT >= TO_DATE(:start, \'YYYY-MM-DD HH24:MI:SS\') AND DEB_EVT <= TO_DATE(:end, \'YYYY-MM-DD HH24:MI:SS\'))
                ORDER BY DEB_EVT ASC
        ';

        $query = $this->getEntityManager()->createNativeQuery($sql, $rsm);
        $data  = $query->execute(
            [
                'mnemo' => $pocitadla,
                'start' => $start->format('Y-m-d H:i:s'),
                'end'   => $end->format('Y-m-d H:i:s'),
            ],
            AbstractQuery::HYDRATE_OBJECT
        );

        return $data;
    }
}
