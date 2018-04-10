<?php

namespace App\Controller;


use Psr\SimpleCache\InvalidArgumentException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Cache\Simple\FilesystemCache;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class PrintController extends Controller
{
    /**
     * @var FilesystemCache
     */
    private $cache;

    public function __construct()
    {
        $this->cache = new FilesystemCache();
    }

    /**
     * @Route(path="/save", methods={"POST"}, name="save_action")
     *
     * @param Request $request
     */
    public function saveDataAction(Request $request)
    {
        $params = $request->request;
        $data = $params->get('data', null);

        if ($data === null) {
            return new JsonResponse([], Response::HTTP_BAD_REQUEST);
        }

        try {
            $cacheId = uniqid();
            $this->cache->set($cacheId, $data);

            return new JsonResponse(['cacheId' => $cacheId], Response::HTTP_OK);
        } catch (InvalidArgumentException $e) {
            return new JsonResponse([], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @Route(path="/print/{id}", name="print_action")
     *
     * @param Request $request
     *
     * @return Response
     * @throws \HttpRuntimeException
     * @throws \Exception
     */
    public function printAction(Request $request, $id)
    {
        if (!$this->cache->has($id)) {
            throw new \Exception();
        }

        try {
            $item = $this->cache->get($id);
            $this->cache->deleteItem($id);

            return $this->render('print/print.html.twig', ['data' => $item]);
        } catch (InvalidArgumentException $e) {
            throw new \Exception();
        }
    }
}
