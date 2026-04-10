package cv.igrp.fatura.parametrizacao.interfaces.rest;

import cv.igrp.framework.stereotype.IgrpController;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.*;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.*;
import cv.igrp.fatura.parametrizacao.application.dto.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@IgrpController
@RestController
@RequestMapping("api/v1/parametrizacao")
@RequiredArgsConstructor
@Tag(name = "Parametrizacao", description = "Gestão de parametrizações")
public class ParametrizacaoController {

    private final PrFaturaTipoRepository prFaturaTipoRepo;
    private final PrSerieRepository prSerieRepo;
    private final PrUnidadeRepository prUnidadeRepo;
    private final PrCategoriaRepository prCategoriaRepo;
    private final PrMoedaRepository prMoedaRepo;
    private final PrEnquadramentoRepository prEnquadramentoRepo;
    private final PrMetodoPagamentoRepository prMetodoPagamentoRepo;
    private final PrImpostoRepository prImpostoRepo;

    // pr_fatura_tipo endpoints
    @GetMapping("/tipos-fatura")
    @Operation(summary = "Listar tipos de fatura")
    public ResponseEntity<List<PrFaturaTipoEntity>> listTiposFatura() {
        return ResponseEntity.ok(prFaturaTipoRepo.findAll());
    }

    @PostMapping("/tipos-fatura")
    @Operation(summary = "Criar tipo de fatura")
    public ResponseEntity<PrFaturaTipoEntity> createTipoFatura(@RequestBody @Valid PrFaturaTipoDTO dto) {
        PrFaturaTipoEntity entity = new PrFaturaTipoEntity();
        entity.setCodigo(dto.getCodigo());
        entity.setDesig(dto.getDesig());
        entity.setDescr(dto.getDescr());
        if (dto.getEstado() != null) entity.setEstado(dto.getEstado());
        return ResponseEntity.ok(prFaturaTipoRepo.save(entity));
    }

    // pr_serie endpoints
    @GetMapping("/series")
    @Operation(summary = "Listar séries")
    public ResponseEntity<List<PrSerieEntity>> listSeries() {
        return ResponseEntity.ok(prSerieRepo.findAll());
    }

    @PostMapping("/series")
    @Operation(summary = "Criar série")
    public ResponseEntity<PrSerieEntity> createSerie(@RequestBody @Valid PrSerieDTO dto) {
        PrSerieEntity entity = new PrSerieEntity();
        entity.setCodigo(dto.getCodigo());
        entity.setDesig(dto.getDesig());
        entity.setContador(dto.getContador() != null ? dto.getContador() : 0);
        if (dto.getEstado() != null) entity.setEstado(dto.getEstado());
        if (dto.getPrFaturaTipoId() != null) {
            prFaturaTipoRepo.findById(dto.getPrFaturaTipoId()).ifPresent(entity::setPrFaturaTipo);
        }
        return ResponseEntity.ok(prSerieRepo.save(entity));
    }

    // pr_unidade endpoints
    @GetMapping("/unidades")
    @Operation(summary = "Listar unidades")
    public ResponseEntity<List<PrUnidadeEntity>> listUnidades() {
        return ResponseEntity.ok(prUnidadeRepo.findAll());
    }

    @PostMapping("/unidades")
    @Operation(summary = "Criar unidade")
    public ResponseEntity<PrUnidadeEntity> createUnidade(@RequestBody @Valid PrUnidadeDTO dto) {
        PrUnidadeEntity entity = new PrUnidadeEntity();
        entity.setCodigo(dto.getCodigo());
        entity.setDesig(dto.getDesig());
        if (dto.getEstado() != null) entity.setEstado(dto.getEstado());
        return ResponseEntity.ok(prUnidadeRepo.save(entity));
    }

    // pr_categoria endpoints
    @GetMapping("/categorias")
    @Operation(summary = "Listar categorias")
    public ResponseEntity<List<PrCategoriaEntity>> listCategorias() {
        return ResponseEntity.ok(prCategoriaRepo.findAll());
    }

    @PostMapping("/categorias")
    @Operation(summary = "Criar categoria")
    public ResponseEntity<PrCategoriaEntity> createCategoria(@RequestBody @Valid PrCategoriaDTO dto) {
        PrCategoriaEntity entity = new PrCategoriaEntity();
        entity.setCodigo(dto.getCodigo());
        entity.setDesig(dto.getDesig());
        entity.setDescr(dto.getDescr());
        if (dto.getEstado() != null) entity.setEstado(dto.getEstado());
        return ResponseEntity.ok(prCategoriaRepo.save(entity));
    }

    // pr_moeda endpoints
    @GetMapping("/moedas")
    @Operation(summary = "Listar moedas")
    public ResponseEntity<List<PrMoedaEntity>> listMoedas() {
        return ResponseEntity.ok(prMoedaRepo.findAll());
    }

    @PostMapping("/moedas")
    @Operation(summary = "Criar moeda")
    public ResponseEntity<PrMoedaEntity> createMoeda(@RequestBody @Valid PrMoedaDTO dto) {
        PrMoedaEntity entity = new PrMoedaEntity();
        entity.setCodigo(dto.getCodigo());
        entity.setDesig(dto.getDesig());
        entity.setSimbolo(dto.getSimbolo());
        if (dto.getEstado() != null) entity.setEstado(dto.getEstado());
        return ResponseEntity.ok(prMoedaRepo.save(entity));
    }

    // pr_enquadramento endpoints
    @GetMapping("/enquadramentos")
    @Operation(summary = "Listar enquadramentos")
    public ResponseEntity<List<PrEnquadramentoEntity>> listEnquadramentos() {
        return ResponseEntity.ok(prEnquadramentoRepo.findAll());
    }

    @PostMapping("/enquadramentos")
    @Operation(summary = "Criar enquadramento")
    public ResponseEntity<PrEnquadramentoEntity> createEnquadramento(@RequestBody @Valid PrEnquadramentoDTO dto) {
        PrEnquadramentoEntity entity = new PrEnquadramentoEntity();
        entity.setCodigo(dto.getCodigo());
        entity.setDesig(dto.getDesig());
        entity.setDescr(dto.getDescr());
        if (dto.getEstado() != null) entity.setEstado(dto.getEstado());
        return ResponseEntity.ok(prEnquadramentoRepo.save(entity));
    }

    // pr_metodo_pagamento endpoints
    @GetMapping("/metodos-pagamento")
    @Operation(summary = "Listar métodos de pagamento")
    public ResponseEntity<List<PrMetodoPagamentoEntity>> listMetodosPagamento() {
        return ResponseEntity.ok(prMetodoPagamentoRepo.findAll());
    }

    @PostMapping("/metodos-pagamento")
    @Operation(summary = "Criar método de pagamento")
    public ResponseEntity<PrMetodoPagamentoEntity> createMetodoPagamento(@RequestBody @Valid PrMetodoPagamentoDTO dto) {
        PrMetodoPagamentoEntity entity = new PrMetodoPagamentoEntity();
        entity.setCodigo(dto.getCodigo());
        entity.setDesig(dto.getDesig());
        entity.setDescr(dto.getDescr());
        if (dto.getEstado() != null) entity.setEstado(dto.getEstado());
        return ResponseEntity.ok(prMetodoPagamentoRepo.save(entity));
    }

    // pr_imposto endpoints
    @GetMapping("/impostos")
    @Operation(summary = "Listar impostos")
    public ResponseEntity<List<PrImpostoEntity>> listImpostos() {
        return ResponseEntity.ok(prImpostoRepo.findAll());
    }

    @PostMapping("/impostos")
    @Operation(summary = "Criar imposto")
    public ResponseEntity<PrImpostoEntity> createImposto(@RequestBody @Valid PrImpostoDTO dto) {
        PrImpostoEntity entity = new PrImpostoEntity();
        entity.setCodigo(dto.getCodigo());
        entity.setDesig(dto.getDesig());
        entity.setDescr(dto.getDescr());
        entity.setTipoCalculo(dto.getTipoCalculo());
        entity.setValor(dto.getValor());
        entity.setAplicaRetencao(dto.getAplicaRetencao() != null ? dto.getAplicaRetencao() : false);
        entity.setContaGlId(dto.getContaGlId());
        if (dto.getEstado() != null) entity.setEstado(dto.getEstado());
        return ResponseEntity.ok(prImpostoRepo.save(entity));
    }
}
