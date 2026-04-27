package cv.igrp.fatura.venda.infrastructure.persistence.repository;

import cv.igrp.fatura.venda.infrastructure.persistence.entity.FaturaVendaItemEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaturaVendaItemRepository extends JpaRepository<FaturaVendaItemEntity, Integer> {

    @Query("SELECT i.desig, MAX(i.codigoArtigo), SUM(i.quantidade), COALESCE(SUM(i.valorTotal), 0) " +
           "FROM FaturaVendaItemEntity i " +
           "JOIN i.faturaVenda f " +
           "WHERE f.estado = 'CONFIRMADO' " +
           "GROUP BY i.desig " +
           "ORDER BY COALESCE(SUM(i.valorTotal), 0) DESC")
    List<Object[]> top5ProdutosVendidos(Pageable pageable);
}
