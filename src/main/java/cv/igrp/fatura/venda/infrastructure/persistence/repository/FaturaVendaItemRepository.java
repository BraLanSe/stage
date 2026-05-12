package cv.igrp.fatura.venda.infrastructure.persistence.repository;

import cv.igrp.fatura.venda.infrastructure.persistence.entity.FaturaVendaItemEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaturaVendaItemRepository extends JpaRepository<FaturaVendaItemEntity, Integer> {

    // ── Analytics ────────────────────────────────────────────────

    @Query("SELECT i.desig, SUM(i.valorTotal), SUM(i.quantidade) " +
           "FROM FaturaVendaItemEntity i " +
           "WHERE i.faturaVenda.estado = 'CONFIRMADO' " +
           "GROUP BY i.desig " +
           "ORDER BY SUM(i.valorTotal) DESC")
    List<Object[]> findTopProdutos(Pageable pageable);

    @Query("SELECT i.desig, i.codigoArtigo, COALESCE(SUM(i.quantidade), 0), COALESCE(SUM(i.valorTotal), 0) " +
           "FROM FaturaVendaItemEntity i " +
           "WHERE i.faturaVenda.estado = 'CONFIRMADO' " +
           "GROUP BY i.desig, i.codigoArtigo " +
           "ORDER BY SUM(i.valorTotal) DESC")
    List<Object[]> top5ProdutosVendidos(Pageable pageable);
}
