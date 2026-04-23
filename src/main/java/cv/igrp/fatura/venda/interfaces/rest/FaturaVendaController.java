package cv.igrp.fatura.venda.interfaces.rest;

import cv.igrp.framework.stereotype.IgrpController;
import cv.igrp.framework.core.domain.CommandBus;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.ClienteRepository;
import cv.igrp.fatura.venda.application.commands.ConfirmarFaturaVendaCommand;
import cv.igrp.fatura.venda.application.commands.CreateFaturaVendaCommand;
import cv.igrp.fatura.venda.application.dto.FaturaVendaAtualizarDTO;
import cv.igrp.fatura.venda.application.dto.FaturaVendaCreateDTO;
import cv.igrp.fatura.venda.application.dto.FaturaVendaItemAtualizarDTO;
import cv.igrp.fatura.venda.infrastructure.persistence.entity.FaturaVendaEntity;
import cv.igrp.fatura.venda.infrastructure.persistence.entity.FaturaVendaItemEntity;
import cv.igrp.fatura.venda.infrastructure.persistence.repository.FaturaVendaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

import java.util.List;

@IgrpController
@RestController
@RequestMapping("api/v1/faturas-venda")
@RequiredArgsConstructor
@Tag(name = "FaturaVenda", description = "Gestão de faturas de venda")
public class FaturaVendaController {

    private final CommandBus commandBus;
    private final FaturaVendaRepository faturaVendaRepo;
    private final ClienteRepository clienteRepo;

    @GetMapping
    @Operation(summary = "Listar faturas de venda")
    public ResponseEntity<List<FaturaVendaEntity>> list() {
        return ResponseEntity.ok(faturaVendaRepo.findAll());
    }

    @PostMapping
    @Operation(summary = "Criar fatura de venda")
    public ResponseEntity<FaturaVendaEntity> create(@RequestBody @Valid FaturaVendaCreateDTO dto) {
        return commandBus.send(new CreateFaturaVendaCommand(dto));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter fatura de venda por ID")
    public ResponseEntity<FaturaVendaEntity> getById(@PathVariable Integer id) {
        return faturaVendaRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar fatura de venda (apenas RASCUNHO)")
    public ResponseEntity<FaturaVendaEntity> update(@PathVariable Integer id,
                                                    @RequestBody FaturaVendaAtualizarDTO dto) {
        return faturaVendaRepo.findById(id).map(fatura -> {
            if ("CONFIRMADO".equals(fatura.getEstado())) {
                return ResponseEntity.status(422).<FaturaVendaEntity>build();
            }
            if (dto.getClienteId() != null) {
                clienteRepo.findById(dto.getClienteId()).ifPresent(fatura::setCliente);
            }
            if (dto.getNota() != null) fatura.setNota(dto.getNota());
            if (dto.getTermCondicoes() != null) fatura.setTermCondicoes(dto.getTermCondicoes());
            if (dto.getItems() != null) {
                fatura.getItems().clear();
                for (int i = 0; i < dto.getItems().size(); i++) {
                    FaturaVendaItemAtualizarDTO itemDto = dto.getItems().get(i);
                    FaturaVendaItemEntity item = new FaturaVendaItemEntity();
                    item.setFaturaVenda(fatura);
                    item.setNumLinha(i + 1);
                    item.setDesig(itemDto.getDesig() != null ? itemDto.getDesig() : "");
                    item.setDescr(itemDto.getDescr());
                    item.setCodigoArtigo(itemDto.getCodigoArtigo());
                    BigDecimal qty = itemDto.getQuantidade() != null ? itemDto.getQuantidade() : BigDecimal.ONE;
                    BigDecimal preco = itemDto.getPrecoUnitario() != null ? itemDto.getPrecoUnitario() : BigDecimal.ZERO;
                    BigDecimal descPerc = itemDto.getDescontoComercialPerc() != null ? itemDto.getDescontoComercialPerc() : BigDecimal.ZERO;
                    BigDecimal iva = itemDto.getPercentagemIva() != null ? itemDto.getPercentagemIva() : BigDecimal.ZERO;
                    BigDecimal bruto = qty.multiply(preco);
                    BigDecimal descValor = bruto.multiply(descPerc).divide(BigDecimal.valueOf(100));
                    BigDecimal liquido = bruto.subtract(descValor);
                    BigDecimal imposto = liquido.multiply(iva).divide(BigDecimal.valueOf(100));
                    BigDecimal total = liquido.add(imposto);
                    item.setQuantidade(qty);
                    item.setPrecoUnitario(preco);
                    item.setDescontoComercialPerc(descPerc.compareTo(BigDecimal.ZERO) > 0 ? descPerc : null);
                    item.setDescontoComercialValor(descValor.compareTo(BigDecimal.ZERO) > 0 ? descValor : null);
                    item.setValorBruto(bruto);
                    item.setValorLiquido(liquido);
                    item.setValorImposto(imposto);
                    item.setValorTotal(total);
                    fatura.getItems().add(item);
                }
                BigDecimal valorIliquido = fatura.getItems().stream()
                        .map(FaturaVendaItemEntity::getValorBruto)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal valorImposto = fatura.getItems().stream()
                        .map(FaturaVendaItemEntity::getValorImposto)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                fatura.setValorIliquido(valorIliquido);
                fatura.setValorImposto(valorImposto);
                fatura.setValorFatura(valorIliquido.add(valorImposto));
            }
            return ResponseEntity.ok(faturaVendaRepo.save(fatura));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/confirmar")
    @Operation(summary = "Confirmar fatura de venda")
    public ResponseEntity<FaturaVendaEntity> confirmar(@PathVariable Integer id) {
        return commandBus.send(new ConfirmarFaturaVendaCommand(id));
    }

    @PutMapping("/{id}/anular")
    @Operation(summary = "Anular fatura de venda")
    public ResponseEntity<FaturaVendaEntity> anular(@PathVariable Integer id) {
        return faturaVendaRepo.findById(id).map(f -> {
            f.setEstado("ANULADO");
            return ResponseEntity.ok(faturaVendaRepo.save(f));
        }).orElse(ResponseEntity.notFound().build());
    }
}
