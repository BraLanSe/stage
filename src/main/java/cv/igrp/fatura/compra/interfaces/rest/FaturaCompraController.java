package cv.igrp.fatura.compra.interfaces.rest;

import cv.igrp.framework.stereotype.IgrpController;
import cv.igrp.framework.core.domain.CommandBus;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.FornecedorRepository;
import cv.igrp.fatura.compra.application.commands.ConfirmarFaturaCompraCommand;
import cv.igrp.fatura.compra.application.commands.CreateFaturaCompraCommand;
import cv.igrp.fatura.compra.application.dto.FaturaCompraAtualizarDTO;
import cv.igrp.fatura.compra.application.dto.FaturaCompraCreateDTO;
import cv.igrp.fatura.compra.application.dto.FaturaCompraItemAtualizarDTO;
import cv.igrp.fatura.compra.application.dto.FaturaCompraReadDTO;
import cv.igrp.fatura.compra.application.service.FaturaCompraPdfService;
import cv.igrp.fatura.compra.infrastructure.persistence.entity.FaturaCompraEntity;
import cv.igrp.fatura.compra.infrastructure.persistence.entity.FaturaCompraItemEntity;
import cv.igrp.fatura.compra.infrastructure.persistence.repository.FaturaCompraRepository;
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
@RequestMapping(value = "api/v1/faturas-compra", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "FaturaCompra", description = "Gestão de faturas de compra")
public class FaturaCompraController {

    private static final Logger LOGGER = LoggerFactory.getLogger(FaturaCompraController.class);

    private final CommandBus commandBus;
    private final FaturaCompraRepository faturaCompraRepo;
    private final FornecedorRepository fornecedorRepo;
    private final FaturaCompraPdfService pdfService;

    @GetMapping
    @Operation(summary = "Listar faturas de compra")
    public ResponseEntity<List<FaturaCompraReadDTO>> list() {
        return ResponseEntity.ok(faturaCompraRepo.findAll().stream()
                .map(FaturaCompraReadDTO::from)
                .toList());
    }

    @PostMapping
    @Operation(summary = "Criar fatura de compra")
    public ResponseEntity<FaturaCompraReadDTO> create(@RequestBody @Valid FaturaCompraCreateDTO dto) {
        return toDto(commandBus.send(new CreateFaturaCompraCommand(dto)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter fatura de compra por ID")
    public ResponseEntity<FaturaCompraReadDTO> getById(@PathVariable Integer id) {
        return faturaCompraRepo.findById(id)
                .map(entity -> ResponseEntity.ok(FaturaCompraReadDTO.from(entity)))
                .orElse(ResponseEntity.notFound().build());
    }

    @Transactional
    @PutMapping("/{id}")
    @Operation(summary = "Atualizar fatura de compra (apenas RASCUNHO)")
    public ResponseEntity<FaturaCompraReadDTO> update(@PathVariable Integer id,
                                                      @RequestBody FaturaCompraAtualizarDTO dto) {
        return faturaCompraRepo.findById(id).map(fatura -> {
            if ("CONFIRMADO".equals(fatura.getEstado())) {
                return ResponseEntity.status(422).<FaturaCompraReadDTO>build();
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
                    var calc = FaturaItemCalculo.calcular(qty, preco, null, itemDto.getPercentagemIva());
                    item.setQuantidade(qty);
                    item.setPrecoUnitario(preco);
                    item.setValorBruto(calc.valorBruto());
                    item.setValorLiquido(calc.valorLiquido());
                    item.setValorImposto(calc.valorImposto());
                    item.setValorTotal(calc.valorTotal());
                    fatura.getItems().add(item);
                }
                BigDecimal valorIliquido = fatura.getItems().stream()
                        .map(FaturaCompraItemEntity::getValorBruto)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .setScale(2, RoundingMode.HALF_UP);
                BigDecimal valorImposto = fatura.getItems().stream()
                        .map(FaturaCompraItemEntity::getValorImposto)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .setScale(2, RoundingMode.HALF_UP);
                BigDecimal valorFatura = valorIliquido.add(valorImposto);
                fatura.setValorIliquido(valorIliquido);
                fatura.setValorImposto(valorImposto);
                fatura.setValorFatura(valorFatura);
                fatura.setValorPorPagar(valorFatura);
            }
            return ResponseEntity.ok(FaturaCompraReadDTO.from(faturaCompraRepo.save(fatura)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/confirmar")
    @Operation(summary = "Confirmar fatura de compra")
    public ResponseEntity<FaturaCompraReadDTO> confirmar(@PathVariable Integer id) {
        return toDto(commandBus.send(new ConfirmarFaturaCompraCommand(id)));
    }

    private static ResponseEntity<FaturaCompraReadDTO> toDto(ResponseEntity<FaturaCompraEntity> result) {
        FaturaCompraEntity body = result.getBody();
        if (body == null) return ResponseEntity.status(result.getStatusCode()).build();
        return ResponseEntity.status(result.getStatusCode()).body(FaturaCompraReadDTO.from(body));
    }

    @PutMapping("/{id}/anular")
    @Operation(summary = "Anular fatura de compra")
    public ResponseEntity<FaturaCompraReadDTO> anular(@PathVariable Integer id) {
        return faturaCompraRepo.findById(id).map(f -> {
            f.setEstado("ANULADO");
            return ResponseEntity.ok(FaturaCompraReadDTO.from(faturaCompraRepo.save(f)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/{id}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @Transactional(readOnly = true)
    @Operation(summary = "Exportar fatura de compra em PDF")
    public ResponseEntity<byte[]> pdf(@PathVariable Integer id) {
        return faturaCompraRepo.findById(id)
                .map(fatura -> {
                    byte[] bytes = pdfService.gerarPdf(FaturaCompraReadDTO.from(fatura));
                    String filename = "fatura-compra-" + (fatura.getCodigo() != null ? fatura.getCodigo() : id) + ".pdf";
                    return ResponseEntity.ok()
                            .contentType(MediaType.APPLICATION_PDF)
                            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                            .body(bytes);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
