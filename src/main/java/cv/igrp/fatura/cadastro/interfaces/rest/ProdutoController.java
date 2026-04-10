package cv.igrp.fatura.cadastro.interfaces.rest;

import cv.igrp.framework.stereotype.IgrpController;
import cv.igrp.fatura.cadastro.application.dto.ProdutoCreateDTO;
import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.ProdutoEntity;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.ProdutoRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrCategoriaRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrImpostoRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrUnidadeRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@IgrpController
@RestController
@RequestMapping("api/v1/produtos")
@RequiredArgsConstructor
@Tag(name = "Produtos", description = "Gestão de produtos")
public class ProdutoController {

    private final ProdutoRepository produtoRepo;
    private final PrCategoriaRepository prCategoriaRepo;
    private final PrUnidadeRepository prUnidadeRepo;
    private final PrImpostoRepository prImpostoRepo;

    @GetMapping
    @Operation(summary = "Listar todos os produtos")
    public ResponseEntity<List<ProdutoEntity>> listAll() {
        return ResponseEntity.ok(produtoRepo.findAll());
    }

    @PostMapping
    @Operation(summary = "Criar produto")
    public ResponseEntity<ProdutoEntity> create(@RequestBody @Valid ProdutoCreateDTO dto) {
        ProdutoEntity entity = new ProdutoEntity();
        entity.setCodigo(dto.getCodigo());
        entity.setDesig(dto.getDesig());
        entity.setDescr(dto.getDescr());
        entity.setPreco(dto.getPreco());
        entity.setDescontoComercial(dto.getDescontoComercial());
        entity.setControlarStock(dto.getControlarStock() != null ? dto.getControlarStock() : false);
        entity.setContaGlId(dto.getContaGlId());
        entity.setContaGlCompraId(dto.getContaGlCompraId());
        if (dto.getEstado() != null) entity.setEstado(dto.getEstado());
        if (dto.getPrCategoriaId() != null) {
            prCategoriaRepo.findById(dto.getPrCategoriaId()).ifPresent(entity::setPrCategoria);
        }
        if (dto.getPrUnidadeId() != null) {
            prUnidadeRepo.findById(dto.getPrUnidadeId()).ifPresent(entity::setPrUnidade);
        }
        if (dto.getImpostoVendaId() != null) {
            prImpostoRepo.findById(dto.getImpostoVendaId()).ifPresent(entity::setImpostoVenda);
        }
        if (dto.getImpostoCompraId() != null) {
            prImpostoRepo.findById(dto.getImpostoCompraId()).ifPresent(entity::setImpostoCompra);
        }
        return ResponseEntity.ok(produtoRepo.save(entity));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter produto por ID")
    public ResponseEntity<ProdutoEntity> getById(@PathVariable Integer id) {
        return produtoRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar produto")
    public ResponseEntity<ProdutoEntity> update(@PathVariable Integer id, @RequestBody @Valid ProdutoCreateDTO dto) {
        return produtoRepo.findById(id).map(entity -> {
            entity.setCodigo(dto.getCodigo());
            entity.setDesig(dto.getDesig());
            entity.setDescr(dto.getDescr());
            entity.setPreco(dto.getPreco());
            entity.setDescontoComercial(dto.getDescontoComercial());
            entity.setControlarStock(dto.getControlarStock() != null ? dto.getControlarStock() : entity.getControlarStock());
            entity.setContaGlId(dto.getContaGlId());
            entity.setContaGlCompraId(dto.getContaGlCompraId());
            if (dto.getEstado() != null) entity.setEstado(dto.getEstado());
            if (dto.getPrCategoriaId() != null) {
                prCategoriaRepo.findById(dto.getPrCategoriaId()).ifPresent(entity::setPrCategoria);
            }
            if (dto.getPrUnidadeId() != null) {
                prUnidadeRepo.findById(dto.getPrUnidadeId()).ifPresent(entity::setPrUnidade);
            }
            if (dto.getImpostoVendaId() != null) {
                prImpostoRepo.findById(dto.getImpostoVendaId()).ifPresent(entity::setImpostoVenda);
            }
            if (dto.getImpostoCompraId() != null) {
                prImpostoRepo.findById(dto.getImpostoCompraId()).ifPresent(entity::setImpostoCompra);
            }
            return ResponseEntity.ok(produtoRepo.save(entity));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar produto")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!produtoRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        produtoRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
