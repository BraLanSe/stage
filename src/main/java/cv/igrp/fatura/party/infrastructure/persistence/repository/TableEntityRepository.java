package cv.igrp.fatura.party.infrastructure.persistence.repository;

import cv.igrp.fatura.party.infrastructure.persistence.entity.TableEntity;
import cv.igrp.fatura.shared.domain.exceptions.IgrpResponseStatusException;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.http.HttpStatus;
import java.util.Optional;



@Repository
public interface TableEntityRepository extends
    JpaRepository<TableEntity, Integer>,
    JpaSpecificationExecutor<TableEntity>
{

      default TableEntity findByIdOrThrow(Integer id) {
          return this.findById(id)
          .orElseThrow(() -> IgrpResponseStatusException.of(HttpStatus.NOT_FOUND,"TableEntity not found for id: " + id));
      }

}