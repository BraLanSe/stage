package cv.igrp.fatura.venda.interfaces.rest;

import cv.igrp.framework.stereotype.IgrpController;
import cv.igrp.framework.core.domain.CommandBus;
import cv.igrp.fatura.venda.application.commands.AnularFaturaVendaCommand;
import cv.igrp.fatura.venda.application.commands.ConfirmarFaturaVendaCommand;
import cv.igrp.fatura.venda.application.commands.CreateFaturaVendaCommand;
import cv.igrp.fatura.venda.application.commands.UpdateFaturaVendaCommand;
import cv.igrp.fatura.venda.application.dto.FaturaVendaCreateDTO;
import cv.igrp.fatura.venda.application.service.FaturaVendaPdfService;
import cv.igrp.fatura.venda.infrastructure.persistence.entity.FaturaVendaEntity;
import cv.igrp.fatura.venda.infrastructure.persistence.repository.FaturaVendaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@IgrpController
@RestController
@RequestMapping(value = "api/v1/faturas-venda", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "FaturaVenda", description = "Gestão de faturas de venda")
public class FaturaVendaController {

    private static final Logger LOGGER = LoggerFactory.getLogger(FaturaVendaController.class);

    private final CommandBus commandBus;
    private final FaturaVendaRepository faturaVendaRepo;
    private final FaturaVendaPdfService pdfService;

    @GetMapping
    @Operation(summary = "Listar faturas de venda com filtros opcionais")
    @ApiResponse(responseCode = "200", description = "Lista paginada de faturas")
    public ResponseEntity<Page<FaturaVendaEntity>> list(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String dtInicio,
            @RequestParam(required = false) String dtFim,
            @RequestParam(required = false) Integer clienteId,
            Pageable pageable) {
        LocalDate inicio = (dtInicio != null && !dtInicio.isBlank()) ? LocalDate.parse(dtInicio) : null;
        LocalDate fim    = (dtFim    != null && !dtFim.isBlank())    ? LocalDate.parse(dtFim)    : null;
        String estadoFilter = (estado != null && !estado.isBlank()) ? estado : null;
        if (inicio != null || fim != null || clienteId != null) {
            return ResponseEntity.ok(faturaVendaRepo.findWithFilters(estadoFilter, inicio, fim, clienteId, pageable));
        }
        if (estadoFilter != null) {
            return ResponseEntity.ok(faturaVendaRepo.findByEstado(estadoFilter, pageable));
        }
        return ResponseEntity.ok(faturaVendaRepo.findAllFetch(pageable));
    }

    @PostMapping
    @Operation(summary = "Criar fatura de venda")
    @ApiResponse(responseCode = "200", description = "Fatura criada com sucesso")
    @ApiResponse(responseCode = "400", description = "Dados inválidos ou campo obrigatório ausente")
    @ApiResponse(responseCode = "404", description = "Cliente, tipo de fatura ou série não encontrado")
    @ApiResponse(responseCode = "422", description = "Regra de negócio violada (ex: data vencimento < data faturação)")
    public ResponseEntity<FaturaVendaEntity> create(@RequestBody @Valid FaturaVendaCreateDTO dto) {
        LOGGER.info("[DEBUG] POST /faturas-venda — body recebido: {}", dto);
        return commandBus.send(new CreateFaturaVendaCommand(dto));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter fatura de venda por ID")
    @ApiResponse(responseCode = "200", description = "Fatura encontrada")
    @ApiResponse(responseCode = "404", description = "Fatura não encontrada")
    public ResponseEntity<FaturaVendaEntity> getById(@PathVariable Integer id) {
        return faturaVendaRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar fatura de venda (apenas RASCUNHO)")
    @ApiResponse(responseCode = "200", description = "Fatura atualizada com sucesso")
    @ApiResponse(responseCode = "400", description = "Dados inválidos ou campo obrigatório ausente")
    @ApiResponse(responseCode = "404", description = "Fatura ou cliente não encontrado")
    @ApiResponse(responseCode = "422", description = "Fatura não está em RASCUNHO ou regra de negócio violada")
    public ResponseEntity<FaturaVendaEntity> update(@PathVariable Integer id,
                                                    @RequestBody @Valid FaturaVendaCreateDTO dto) {
        return commandBus.send(new UpdateFaturaVendaCommand(id, dto));
    }

    @PutMapping("/{id}/confirmar")
    @Operation(summary = "Confirmar fatura de venda")
    @ApiResponse(responseCode = "200", description = "Fatura confirmada com sucesso")
    @ApiResponse(responseCode = "404", description = "Fatura não encontrada")
    @ApiResponse(responseCode = "422", description = "Fatura não pode ser confirmada no estado atual")
    public ResponseEntity<FaturaVendaEntity> confirmar(@PathVariable Integer id) {
        return commandBus.send(new ConfirmarFaturaVendaCommand(id));
    }

    @PutMapping("/{id}/anular")
    @Operation(summary = "Anular fatura de venda")
    @ApiResponse(responseCode = "200", description = "Fatura anulada com sucesso")
    @ApiResponse(responseCode = "404", description = "Fatura não encontrada")
    @ApiResponse(responseCode = "422", description = "Fatura não pode ser anulada no estado atual")
    public ResponseEntity<FaturaVendaEntity> anular(@PathVariable Integer id) {
        return commandBus.send(new AnularFaturaVendaCommand(id));
    }

    @GetMapping(value = "/{id}/print", produces = MediaType.APPLICATION_PDF_VALUE)
    @Operation(summary = "Exportar fatura de venda em PDF")
    @ApiResponse(responseCode = "200", description = "PDF gerado com sucesso")
    @ApiResponse(responseCode = "404", description = "Fatura não encontrada")
    public ResponseEntity<byte[]> print(@PathVariable Integer id) {
        return faturaVendaRepo.findByIdWithItems(id)
                .map(fatura -> {
                    byte[] pdf = pdfService.generate(fatura);
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentDisposition(ContentDisposition.inline()
                            .filename("fatura-" + fatura.getCodigo() + ".pdf").build());
                    return ResponseEntity.ok().headers(headers).body(pdf);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
