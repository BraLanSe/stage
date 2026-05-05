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
import java.util.Optional;

@Repository
public interface FaturaVendaRepository extends JpaRepository<FaturaVendaEntity, Integer> {
    @Query("SELECT f FROM FaturaVendaEntity f JOIN FETCH f.cliente JOIN FETCH f.tipoFatura JOIN FETCH f.prSerie LEFT JOIN FETCH f.items WHERE f.id = :id")
    Optional<FaturaVendaEntity> findByIdWithItems(@Param("id") Integer id);

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

    @Query(value = "SELECT DISTINCT f FROM FaturaVendaEntity f " +
           "JOIN FETCH f.cliente JOIN FETCH f.tipoFatura JOIN FETCH f.prSerie " +
           "WHERE (:estado IS NULL OR f.estado = :estado) " +
           "AND (:dtInicio IS NULL OR f.dtFaturacao >= :dtInicio) " +
           "AND (:dtFim IS NULL OR f.dtFaturacao <= :dtFim) " +
           "AND (:clienteId IS NULL OR f.cliente.id = :clienteId)",
           countQuery = "SELECT COUNT(DISTINCT f) FROM FaturaVendaEntity f " +
           "WHERE (:estado IS NULL OR f.estado = :estado) " +
           "AND (:dtInicio IS NULL OR f.dtFaturacao >= :dtInicio) " +
           "AND (:dtFim IS NULL OR f.dtFaturacao <= :dtFim) " +
           "AND (:clienteId IS NULL OR f.cliente.id = :clienteId)")
    Page<FaturaVendaEntity> findWithFilters(
            @Param("estado") String estado,
            @Param("dtInicio") LocalDate dtInicio,
            @Param("dtFim") LocalDate dtFim,
            @Param("clienteId") Integer clienteId,
            Pageable pageable);

    @Query("SELECT extract(month from f.dtFaturacao), COALESCE(SUM(f.valorFatura), 0) " +
           "FROM FaturaVendaEntity f " +
           "WHERE f.estado = 'CONFIRMADO' AND extract(year from f.dtFaturacao) = :ano " +
           "GROUP BY extract(month from f.dtFaturacao) " +
           "ORDER BY extract(month from f.dtFaturacao)")
    List<Object[]> sumValorFaturaByMonth(@Param("ano") int ano);

    @Query("SELECT f.estado, COUNT(f), COALESCE(SUM(f.valorFatura), 0) " +
           "FROM FaturaVendaEntity f GROUP BY f.estado ORDER BY f.estado")
    List<Object[]> countAndSumByEstado();
}
