package cv.igrp.fatura.parametrizacao.interfaces.rest;

import cv.igrp.framework.stereotype.IgrpController;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrCategoriaEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrEnquadramentoEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrFaturaTipoEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrImpostoEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrMetodoPagamentoEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrMoedaEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrSerieEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrUnidadeEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrCategoriaRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrEnquadramentoRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrFaturaTipoRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrImpostoRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrMetodoPagamentoRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrMoedaRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrSerieRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrUnidadeRepository;
import cv.igrp.fatura.parametrizacao.application.dto.PrCategoriaDTO;
import cv.igrp.fatura.parametrizacao.application.dto.PrEnquadramentoDTO;
import cv.igrp.fatura.parametrizacao.application.dto.PrFaturaTipoDTO;
import cv.igrp.fatura.parametrizacao.application.dto.PrImpostoDTO;
import cv.igrp.fatura.parametrizacao.application.dto.PrMetodoPagamentoDTO;
import cv.igrp.fatura.parametrizacao.application.dto.PrMoedaDTO;
import cv.igrp.fatura.parametrizacao.application.dto.PrSerieDTO;
import cv.igrp.fatura.parametrizacao.application.dto.PrUnidadeDTO;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@IgrpController
@RestController
@RequestMapping(value = "api/v1/parametrizacao", produces = MediaType.APPLICATION_JSON_VALUE)
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

    @GetMapping("/tipos-fatura")
    @Operation(summary = "Listar tipos de fatura")
    public ResponseEntity<Page<PrFaturaTipoEntity>> listTiposFatura(Pageable pageable) {
        return ResponseEntity.ok(prFaturaTipoRepo.findAll(pageable));
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

    @GetMapping("/series")
    @Operation(summary = "Listar séries")
    public ResponseEntity<Page<PrSerieEntity>> listSeries(Pageable pageable) {
        return ResponseEntity.ok(prSerieRepo.findAll(pageable));
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

    @GetMapping("/unidades")
    @Operation(summary = "Listar unidades")
    public ResponseEntity<Page<PrUnidadeEntity>> listUnidades(Pageable pageable) {
        return ResponseEntity.ok(prUnidadeRepo.findAll(pageable));
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

    @GetMapping("/categorias")
    @Operation(summary = "Listar categorias")
    public ResponseEntity<Page<PrCategoriaEntity>> listCategorias(Pageable pageable) {
        return ResponseEntity.ok(prCategoriaRepo.findAll(pageable));
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

    @GetMapping("/moedas")
    @Operation(summary = "Listar moedas")
    public ResponseEntity<Page<PrMoedaEntity>> listMoedas(Pageable pageable) {
        return ResponseEntity.ok(prMoedaRepo.findAll(pageable));
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

    @GetMapping("/enquadramentos")
    @Operation(summary = "Listar enquadramentos")
    public ResponseEntity<Page<PrEnquadramentoEntity>> listEnquadramentos(Pageable pageable) {
        return ResponseEntity.ok(prEnquadramentoRepo.findAll(pageable));
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

    @GetMapping("/metodos-pagamento")
    @Operation(summary = "Listar métodos de pagamento")
    public ResponseEntity<Page<PrMetodoPagamentoEntity>> listMetodosPagamento(Pageable pageable) {
        return ResponseEntity.ok(prMetodoPagamentoRepo.findAll(pageable));
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

    @GetMapping("/impostos")
    @Operation(summary = "Listar impostos")
    public ResponseEntity<Page<PrImpostoEntity>> listImpostos(Pageable pageable) {
        return ResponseEntity.ok(prImpostoRepo.findAll(pageable));
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
