package cv.igrp.fatura.contabilidade.interfaces.rest;

import cv.igrp.framework.stereotype.IgrpController;
import cv.igrp.fatura.contabilidade.application.dto.GlContaDTO;
import cv.igrp.fatura.contabilidade.infrastructure.persistence.entity.GlContaEntity;
import cv.igrp.fatura.contabilidade.infrastructure.persistence.repository.GlContaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@IgrpController
@RestController
@RequestMapping("api/v1/contabilidade/contas")
@RequiredArgsConstructor
@Tag(name = "Contabilidade", description = "Gestão de contas do plano de contas")
public class GlContaController {

    private final GlContaRepository glContaRepo;

    @GetMapping
    @Operation(summary = "Listar todas as contas")
    public ResponseEntity<List<GlContaEntity>> listAll() {
        return ResponseEntity.ok(glContaRepo.findAll());
    }

    @PostMapping
    @Operation(summary = "Criar conta")
    public ResponseEntity<GlContaEntity> create(@RequestBody @Valid GlContaDTO dto) {
        GlContaEntity entity = new GlContaEntity();
        entity.setCodigo(dto.getCodigo());
        entity.setDesig(dto.getDesig());
        entity.setDescr(dto.getDescr());
        entity.setTipoConta(dto.getTipoConta());
        entity.setContaPaiId(dto.getContaPaiId());
        entity.setAceitaLancamento(dto.getAceitaLancamento() != null ? dto.getAceitaLancamento() : true);
        if (dto.getEstado() != null) entity.setEstado(dto.getEstado());
        return ResponseEntity.ok(glContaRepo.save(entity));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter conta por ID")
    public ResponseEntity<GlContaEntity> getById(@PathVariable Integer id) {
        return glContaRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
