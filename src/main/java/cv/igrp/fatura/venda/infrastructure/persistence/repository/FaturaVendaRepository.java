package cv.igrp.fatura.venda.infrastructure.persistence.repository;

import cv.igrp.fatura.venda.infrastructure.persistence.entity.FaturaVendaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface FaturaVendaRepository extends JpaRepository<FaturaVendaEntity, Integer> {

    List<FaturaVendaEntity> findByCliente_Id(Integer clienteId);
    List<FaturaVendaEntity> findByEstado(String estado);

    // ── Analytics ────────────────────────────────────────────────

    @Query("SELECT SUM(f.valorFatura) FROM FaturaVendaEntity f WHERE f.estado = 'CONFIRMADO'")
    BigDecimal sumTotalVendas();

    @Query("SELECT f.estado, COUNT(f) FROM FaturaVendaEntity f GROUP BY f.estado")
    List<Object[]> countByEstado();

    @Query(value = "SELECT YEAR(dt_faturacao) AS yr, MONTH(dt_faturacao) AS mo, SUM(valor_fatura) AS total " +
                   "FROM fatura_venda WHERE estado = 'CONFIRMADO' AND YEAR(dt_faturacao) = :ano " +
                   "GROUP BY YEAR(dt_faturacao), MONTH(dt_faturacao) " +
                   "ORDER BY yr, mo",
           nativeQuery = true)
    List<Object[]> findMensaisConfirmadas(@Param("ano") int ano);
}
