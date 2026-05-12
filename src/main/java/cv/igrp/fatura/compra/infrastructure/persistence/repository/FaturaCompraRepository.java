package cv.igrp.fatura.compra.infrastructure.persistence.repository;

import cv.igrp.fatura.compra.infrastructure.persistence.entity.FaturaCompraEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface FaturaCompraRepository extends JpaRepository<FaturaCompraEntity, Integer> {

    List<FaturaCompraEntity> findByFornecedor_Id(Integer fornecedorId);
    List<FaturaCompraEntity> findByEstado(String estado);

    // ── Analytics ────────────────────────────────────────────────

    @Query("SELECT SUM(f.valorFatura) FROM FaturaCompraEntity f WHERE f.estado = 'CONFIRMADO'")
    BigDecimal sumTotalDespesas();

    @Query("SELECT YEAR(f.dtFaturacao), MONTH(f.dtFaturacao), SUM(f.valorFatura) " +
           "FROM FaturaCompraEntity f WHERE f.estado = 'CONFIRMADO' AND YEAR(f.dtFaturacao) = :ano " +
           "GROUP BY YEAR(f.dtFaturacao), MONTH(f.dtFaturacao) " +
           "ORDER BY YEAR(f.dtFaturacao), MONTH(f.dtFaturacao)")
    List<Object[]> findMensaisConfirmadas(@Param("ano") int ano);
}
