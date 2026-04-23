package cv.igrp.fatura.compra.interfaces.rest;

import cv.igrp.framework.stereotype.IgrpController;
import cv.igrp.framework.core.domain.CommandBus;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.FornecedorRepository;
import cv.igrp.fatura.compra.application.commands.CreateFaturaCompraCommand;
import cv.igrp.fatura.compra.application.dto.FaturaCompraAtualizarDTO;
import cv.igrp.fatura.compra.application.dto.FaturaCompraCreateDTO;
import cv.igrp.fatura.compra.application.dto.FaturaCompraItemAtualizarDTO;
import cv.igrp.fatura.compra.infrastructure.persistence.entity.FaturaCompraEntity;
import cv.igrp.fatura.compra.infrastructure.persistence.entity.FaturaCompraItemEntity;
import cv.igrp.fatura.compra.infrastructure.persistence.repository.FaturaCompraRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@IgrpController
@RestController
@RequestMapping("api/v1/faturas-compra")
@RequiredArgsConstructor
@Tag(name = "FaturaCompra", description = "Gestão de faturas de compra")
public class FaturaCompraController {

    private final CommandBus commandBus;
    private final FaturaCompraRepository faturaCompraRepo;
    private final FornecedorRepository fornecedorRepo;

    @GetMapping
    @Operation(summary = "Listar faturas de compra")
    public ResponseEntity<List<FaturaCompraEntity>> list() {
        return ResponseEntity.ok(faturaCompraRepo.findAll());
    }

    @PostMapping
    @Operation(summary = "Criar fatura de compra")
    public ResponseEntity<FaturaCompraEntity> create(@RequestBody @Valid FaturaCompraCreateDTO dto) {
        return commandBus.send(new CreateFaturaCompraCommand(dto));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter fatura de compra por ID")
    public ResponseEntity<FaturaCompraEntity> getById(@PathVariable Integer id) {
        return faturaCompraRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Transactional
    @PutMapping("/{id}")
    @Operation(summary = "Atualizar fatura de compra (apenas RASCUNHO)")
    public ResponseEntity<FaturaCompraEntity> update(@PathVariable Integer id,
                                                     @RequestBody FaturaCompraAtualizarDTO dto) {
        return faturaCompraRepo.findById(id).map(fatura -> {
            if ("CONFIRMADO".equals(fatura.getEstado())) {
                return ResponseEntity.status(422).<FaturaCompraEntity>build();
            }
            if (dto.getFornecedorId() != null) {
                fornecedorRepo.findById(dto.getFornecedorId()).ifPresent(fatura::setFornecedor);
            }
            if (dto.getNota() != null) fatura.setNota(dto.getNota());
            if (dto.getTermCondicoes() != null) fatura.setTermCondicoes(dto.getTermCondicoes());
            if (dto.getItems() != null) {
                fatura.getItems().clear();
                for (int i = 0; i < dto.getItems().size(); i++) {
                    FaturaCompraItemAtualizarDTO itemDto = dto.getItems().get(i);
                    FaturaCompraItemEntity item = new FaturaCompraItemEntity();
                    item.setFaturaCompra(fatura);
                    item.setNumLinha(i + 1);
                    item.setDesig(itemDto.getDesig() != null ? itemDto.getDesig() : "");
                    item.setDescr(itemDto.getDescr());
                    BigDecimal qty = itemDto.getQuantidade() != null ? itemDto.getQuantidade() : BigDecimal.ONE;
                    BigDecimal preco = itemDto.getPrecoUnitario() != null ? itemDto.getPrecoUnitario() : BigDecimal.ZERO;
                    BigDecimal iva = itemDto.getPercentagemIva() != null ? itemDto.getPercentagemIva() : BigDecimal.ZERO;
                    BigDecimal bruto = qty.multiply(preco);
                    BigDecimal imposto = bruto.multiply(iva).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
                    BigDecimal total = bruto.add(imposto);
                    item.setQuantidade(qty);
                    item.setPrecoUnitario(preco);
                    item.setValorBruto(bruto);
                    item.setValorLiquido(bruto);
                    item.setValorImposto(imposto);
                    item.setValorTotal(total);
                    fatura.getItems().add(item);
                }
                BigDecimal valorIliquido = fatura.getItems().stream()
                        .map(FaturaCompraItemEntity::getValorBruto)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal valorImposto = fatura.getItems().stream()
                        .map(FaturaCompraItemEntity::getValorImposto)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                fatura.setValorIliquido(valorIliquido);
                fatura.setValorImposto(valorImposto);
                fatura.setValorFatura(valorIliquido.add(valorImposto));
            }
            return ResponseEntity.ok(faturaCompraRepo.save(fatura));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/confirmar")
    @Operation(summary = "Confirmar fatura de compra")
    public ResponseEntity<FaturaCompraEntity> confirmar(@PathVariable Integer id) {
        return faturaCompraRepo.findById(id).map(f -> {
            f.setEstado("CONFIRMADO");
            return ResponseEntity.ok(faturaCompraRepo.save(f));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/anular")
    @Operation(summary = "Anular fatura de compra")
    public ResponseEntity<FaturaCompraEntity> anular(@PathVariable Integer id) {
        return faturaCompraRepo.findById(id).map(f -> {
            f.setEstado("ANULADO");
            return ResponseEntity.ok(faturaCompraRepo.save(f));
        }).orElse(ResponseEntity.notFound().build());
    }
}
