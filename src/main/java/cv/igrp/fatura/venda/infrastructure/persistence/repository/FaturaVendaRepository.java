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

    @Query("SELECT YEAR(f.dtFaturacao), MONTH(f.dtFaturacao), SUM(f.valorFatura) " +
           "FROM FaturaVendaEntity f WHERE f.estado = 'CONFIRMADO' AND YEAR(f.dtFaturacao) = :ano " +
           "GROUP BY YEAR(f.dtFaturacao), MONTH(f.dtFaturacao) " +
           "ORDER BY YEAR(f.dtFaturacao), MONTH(f.dtFaturacao)")
    List<Object[]> findMensaisConfirmadas(@Param("ano") int ano);

    @Query("SELECT f.cliente.desig, f.cliente.nif, SUM(f.valorFatura) " +
           "FROM FaturaVendaEntity f WHERE f.estado = 'CONFIRMADO' " +
           "GROUP BY f.cliente.desig, f.cliente.nif " +
           "ORDER BY SUM(f.valorFatura) DESC")
    List<Object[]> findTopClientes(org.springframework.data.domain.Pageable pageable);
}
