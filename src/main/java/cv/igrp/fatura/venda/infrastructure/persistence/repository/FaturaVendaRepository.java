package cv.igrp.fatura.venda.infrastructure.persistence.repository;

import cv.igrp.fatura.venda.infrastructure.persistence.entity.FaturaVendaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FaturaVendaRepository extends JpaRepository<FaturaVendaEntity, Integer> {
    @Query("SELECT f FROM FaturaVendaEntity f JOIN FETCH f.cliente JOIN FETCH f.tipoFatura JOIN FETCH f.prSerie WHERE f.cliente.id = :clienteId")
    List<FaturaVendaEntity> findByCliente_Id(@Param("clienteId") Integer clienteId);

    @Query(value = "SELECT DISTINCT f FROM FaturaVendaEntity f JOIN FETCH f.cliente JOIN FETCH f.tipoFatura JOIN FETCH f.prSerie WHERE f.estado = :estado",
           countQuery = "SELECT COUNT(f) FROM FaturaVendaEntity f WHERE f.estado = :estado")
    Page<FaturaVendaEntity> findByEstado(@Param("estado") String estado, Pageable pageable);

    @Query(value = "SELECT DISTINCT f FROM FaturaVendaEntity f JOIN FETCH f.cliente JOIN FETCH f.tipoFatura JOIN FETCH f.prSerie",
           countQuery = "SELECT COUNT(f) FROM FaturaVendaEntity f")
    Page<FaturaVendaEntity> findAllFetch(Pageable pageable);

    @Query("SELECT COALESCE(SUM(f.valorIliquido), 0) FROM FaturaVendaEntity f WHERE f.estado = 'CONFIRMADO'")
    BigDecimal sumValorIliquido();

    @Query("SELECT COALESCE(SUM(f.valorImposto), 0) FROM FaturaVendaEntity f WHERE f.estado = 'CONFIRMADO'")
    BigDecimal sumValorImposto();

    @Query("SELECT COALESCE(SUM(f.valorFatura), 0) FROM FaturaVendaEntity f WHERE f.estado = 'CONFIRMADO'")
    BigDecimal sumValorFatura();

    @Query("SELECT COALESCE(SUM(f.valorFatura), 0) FROM FaturaVendaEntity f WHERE f.estado = 'CONFIRMADO' AND f.dtFaturacao >= :inicio AND f.dtFaturacao < :fim")
    BigDecimal sumValorFaturaBetween(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT COUNT(f) FROM FaturaVendaEntity f WHERE f.estado = 'CONFIRMADO'")
    Long countConfirmado();

    @Query("SELECT COUNT(f) FROM FaturaVendaEntity f WHERE f.dtFaturacao >= :inicio AND f.dtFaturacao < :fim")
    Long countBetween(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT COALESCE(SUM(f.valorPorPagar), 0) FROM FaturaVendaEntity f WHERE f.estado = 'CONFIRMADO' AND f.pago = false")
    BigDecimal sumValorPorPagar();
}
