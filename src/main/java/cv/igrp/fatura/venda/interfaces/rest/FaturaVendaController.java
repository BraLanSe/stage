package cv.igrp.fatura.venda.interfaces.rest;

import cv.igrp.framework.stereotype.IgrpController;
import cv.igrp.framework.core.domain.CommandBus;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.ClienteRepository;
import cv.igrp.fatura.venda.application.commands.ConfirmarFaturaVendaCommand;
import cv.igrp.fatura.venda.application.commands.CreateFaturaVendaCommand;
import cv.igrp.fatura.venda.application.dto.FaturaVendaAtualizarDTO;
import cv.igrp.fatura.venda.application.dto.FaturaVendaCreateDTO;
import cv.igrp.fatura.venda.application.dto.FaturaVendaItemAtualizarDTO;
import cv.igrp.fatura.venda.application.dto.FaturaVendaReadDTO;
import cv.igrp.fatura.venda.application.service.FaturaPdfService;
import cv.igrp.fatura.venda.infrastructure.persistence.entity.FaturaVendaEntity;
import cv.igrp.fatura.venda.infrastructure.persistence.entity.FaturaVendaItemEntity;
import cv.igrp.fatura.venda.infrastructure.persistence.repository.FaturaVendaRepository;
import cv.igrp.fatura.shared.util.FaturaItemCalculo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@IgrpController
@RestController
@RequestMapping(value = "api/v1/faturas-venda", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "FaturaVenda", description = "Gestão de faturas de venda")
public class FaturaVendaController {

    private static final Logger LOGGER = LoggerFactory.getLogger(FaturaVendaController.class);

    private final CommandBus commandBus;
    private final FaturaVendaRepository faturaVendaRepo;
    private final ClienteRepository clienteRepo;
    private final FaturaPdfService faturaPdfService;

    @GetMapping
    @Operation(summary = "Listar faturas de venda")
    public ResponseEntity<Page<FaturaVendaReadDTO>> list(Pageable pageable) {
        return ResponseEntity.ok(faturaVendaRepo.findAll(pageable).map(FaturaVendaReadDTO::from));
    }

    @PostMapping
    @Operation(summary = "Criar fatura de venda")
    public ResponseEntity<FaturaVendaReadDTO> create(@RequestBody @Valid FaturaVendaCreateDTO dto) {
        return toDto(commandBus.send(new CreateFaturaVendaCommand(dto)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter fatura de venda por ID")
    public ResponseEntity<FaturaVendaReadDTO> getById(@PathVariable Integer id) {
        return faturaVendaRepo.findById(id)
                .map(entity -> ResponseEntity.ok(FaturaVendaReadDTO.from(entity)))
                .orElse(ResponseEntity.notFound().build());
    }

    @Transactional
    @PutMapping("/{id}")
    @Operation(summary = "Atualizar fatura de venda (apenas RASCUNHO)")
    public ResponseEntity<FaturaVendaReadDTO> update(@PathVariable Integer id,
                                                     @RequestBody FaturaVendaAtualizarDTO dto) {
        return faturaVendaRepo.findById(id).map(fatura -> {
            if ("CONFIRMADO".equals(fatura.getEstado())) {
                return ResponseEntity.status(422).<FaturaVendaReadDTO>build();
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
                    var calc = FaturaItemCalculo.calcular(qty, preco, itemDto.getDescontoComercialPerc(), itemDto.getPercentagemIva());
                    item.setQuantidade(qty);
                    item.setPrecoUnitario(preco);
                    item.setDescontoComercialPerc(calc.descontoComercialValor().compareTo(BigDecimal.ZERO) > 0 ? itemDto.getDescontoComercialPerc() : null);
                    item.setDescontoComercialValor(calc.descontoComercialValor().compareTo(BigDecimal.ZERO) > 0 ? calc.descontoComercialValor() : null);
                    item.setValorBruto(calc.valorBruto());
                    item.setValorLiquido(calc.valorLiquido());
                    item.setValorImposto(calc.valorImposto());
                    item.setValorTotal(calc.valorTotal());
                    fatura.getItems().add(item);
                }
                BigDecimal valorIliquido = fatura.getItems().stream()
                        .map(FaturaVendaItemEntity::getValorBruto)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .setScale(2, RoundingMode.HALF_UP);
                BigDecimal valorImposto = fatura.getItems().stream()
                        .map(FaturaVendaItemEntity::getValorImposto)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .setScale(2, RoundingMode.HALF_UP);
                BigDecimal valorFatura = valorIliquido.add(valorImposto);
                fatura.setValorIliquido(valorIliquido);
                fatura.setValorImposto(valorImposto);
                fatura.setValorFatura(valorFatura);
                fatura.setValorPorPagar(valorFatura);
            }
            return ResponseEntity.ok(FaturaVendaReadDTO.from(faturaVendaRepo.save(fatura)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/confirmar")
    @Operation(summary = "Confirmar fatura de venda")
    public ResponseEntity<FaturaVendaReadDTO> confirmar(@PathVariable Integer id) {
        return toDto(commandBus.send(new ConfirmarFaturaVendaCommand(id)));
    }

    private static ResponseEntity<FaturaVendaReadDTO> toDto(ResponseEntity<FaturaVendaEntity> result) {
        FaturaVendaEntity body = result.getBody();
        if (body == null) return ResponseEntity.status(result.getStatusCode()).build();
        return ResponseEntity.status(result.getStatusCode()).body(FaturaVendaReadDTO.from(body));
    }

    @GetMapping("/{id}/pdf")
    @Transactional(readOnly = true)
    @Operation(summary = "Exportar PDF fiscal da fatura de venda")
    public ResponseEntity<byte[]> exportPdf(@PathVariable Integer id) {
        return faturaVendaRepo.findById(id)
                .map(fatura -> {
                    byte[] pdf = faturaPdfService.gerarRecibo(FaturaVendaReadDTO.from(fatura));
                    String filename = "fatura-" + (fatura.getCodigo() != null ? fatura.getCodigo() : id) + ".pdf";
                    return ResponseEntity.ok()
                            .contentType(MediaType.APPLICATION_PDF)
                            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                            .body(pdf);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/anular")
    @Operation(summary = "Anular fatura de venda")
    public ResponseEntity<FaturaVendaReadDTO> anular(@PathVariable Integer id) {
        return faturaVendaRepo.findById(id).map(f -> {
            f.setEstado("ANULADO");
            return ResponseEntity.ok(FaturaVendaReadDTO.from(faturaVendaRepo.save(f)));
        }).orElse(ResponseEntity.notFound().build());
    }
}
