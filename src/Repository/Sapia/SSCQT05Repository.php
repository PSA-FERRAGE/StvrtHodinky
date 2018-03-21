<?php

namespace App\Repository\Sapia;

use App\Entity\Sapia\SSCQT05;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\Query\ResultSetMapping;
use Symfony\Bridge\Doctrine\RegistryInterface;

/**
 * @method SSCQT05|null find($id, $lockMode = null, $lockVersion = null)
 * @method SSCQT05|null findOneBy(array $criteria, array $orderBy = null)
 * @method SSCQT05[]    findAll()
 * @method SSCQT05[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class SSCQT05Repository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, SSCQT05::class);
    }


    public function findAllStvrtHodDataBetweenDates(\DateTime $start, \DateTime $end, $pocitadla, $localisation): array
    {
        $rsm = new ResultSetMapping;
        $rsm->addEntityResult(SSCQT05::class, 't');
        $rsm->addFieldResult('t', 'ID_LOC', 'ID_LOC');
        $rsm->addFieldResult('t', 'ID_MNEMO', 'ID_MNEMO');
        $rsm->addFieldResult('t', 'FIN_EVT', 'FIN_EVT');

        $sql = 'SELECT ID_LOC, ID_MNEMO, TO_CHAR(FIN_EVT, \'YYYY-MM-DD HH24:MI:SS\') AS FIN_EVT
                FROM SSC99_M1.SSCQT05
                WHERE ID_MNEMO IN (:mnemo) AND ID_LOC = :localisation AND
                (FIN_EVT >= TO_DATE(:start, \'YYYY-MM-DD HH24:MI:SS\') AND FIN_EVT <= TO_DATE(:end, \'YYYY-MM-DD HH24:MI:SS\'))
                ORDER BY FIN_EVT ASC
        ';

        $query = $this->getEntityManager()->createNativeQuery($sql, $rsm);
        $data  = $query->execute(
            [
                'mnemo' => $pocitadla,
                'localisation' => $localisation,
                'start' => $start->format('Y-m-d H:i:s'),
                'end'   => $end->format('Y-m-d H:i:s'),
            ],
            AbstractQuery::HYDRATE_OBJECT
        );

        return $data;
    }
}
