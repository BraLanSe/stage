package cv.igrp.fatura.compra.infrastructure.persistence.repository;

import cv.igrp.fatura.compra.infrastructure.persistence.entity.FaturaCompraEntity;
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

    @Query(value = "SELECT YEAR(dt_faturacao) AS yr, MONTH(dt_faturacao) AS mo, SUM(valor_fatura) AS total " +
                   "FROM fatura_compra WHERE estado = 'CONFIRMADO' AND YEAR(dt_faturacao) = :ano " +
                   "GROUP BY YEAR(dt_faturacao), MONTH(dt_faturacao) " +
                   "ORDER BY yr, mo",
           nativeQuery = true)
    List<Object[]> findMensaisConfirmadas(@Param("ano") int ano);
}
