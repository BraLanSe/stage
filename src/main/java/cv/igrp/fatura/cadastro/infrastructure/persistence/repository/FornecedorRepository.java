package cv.igrp.fatura.cadastro.infrastructure.persistence.repository;

import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.FornecedorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FornecedorRepository extends JpaRepository<FornecedorEntity, Integer> {
    Optional<FornecedorEntity> findByCodigo(String codigo);
}
