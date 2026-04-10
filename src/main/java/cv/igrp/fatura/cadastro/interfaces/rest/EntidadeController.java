package cv.igrp.fatura.cadastro.interfaces.rest;

import cv.igrp.framework.stereotype.IgrpController;
import cv.igrp.fatura.cadastro.application.dto.EntidadeDTO;
import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.EntidadeEntity;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.EntidadeRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrEnquadramentoRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrMoedaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@IgrpController
@RestController
@RequestMapping(value = "api/v1/entidade", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Entidade", description = "Gestão da entidade (empresa)")
public class EntidadeController {

    private final EntidadeRepository entidadeRepo;
    private final PrEnquadramentoRepository prEnquadramentoRepo;
    private final PrMoedaRepository prMoedaRepo;

    @GetMapping
    @Operation(summary = "Obter a entidade")
    public ResponseEntity<List<EntidadeEntity>> get() {
        return ResponseEntity.ok(entidadeRepo.findAll());
    }

    @PostMapping
    @Operation(summary = "Criar ou atualizar entidade")
    public ResponseEntity<EntidadeEntity> createOrUpdate(@RequestBody @Valid EntidadeDTO dto) {
        EntidadeEntity entity;
        if (dto.getId() != null && entidadeRepo.existsById(dto.getId())) {
            entity = entidadeRepo.findById(dto.getId()).orElse(new EntidadeEntity());
        } else {
            entity = new EntidadeEntity();
        }
        entity.setCodigo(dto.getCodigo());
        entity.setDesig(dto.getDesig());
        entity.setDescr(dto.getDescr());
        entity.setNif(dto.getNif());
        entity.setEmail(dto.getEmail());
        entity.setTelefone(dto.getTelefone());
        entity.setEndereco(dto.getEndereco());
        entity.setGeografiaId(dto.getGeografiaId());
        if (dto.getEstado() != null) entity.setEstado(dto.getEstado());
        if (dto.getPrEnquadramentoId() != null) {
            prEnquadramentoRepo.findById(dto.getPrEnquadramentoId()).ifPresent(entity::setPrEnquadramento);
        }
        if (dto.getPrMoedaId() != null) {
            prMoedaRepo.findById(dto.getPrMoedaId()).ifPresent(entity::setPrMoeda);
        }
        return ResponseEntity.ok(entidadeRepo.save(entity));
    }
}
