package cv.igrp.fatura.cadastro.infrastructure.persistence.repository;
import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.DadosBancariosEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface DadosBancariosRepository extends JpaRepository<DadosBancariosEntity, Integer> {}