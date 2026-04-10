package cv.igrp.fatura.cadastro.infrastructure.persistence.repository;

import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.EntidadeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EntidadeRepository extends JpaRepository<EntidadeEntity, Integer> {
    Optional<EntidadeEntity> findByNif(String nif);
}
