package cv.igrp.fatura.compra.interfaces.rest;

import cv.igrp.framework.stereotype.IgrpController;
import cv.igrp.framework.core.domain.CommandBus;
import cv.igrp.fatura.compra.application.commands.AnularFaturaCompraCommand;
import cv.igrp.fatura.compra.application.commands.ConfirmarFaturaCompraCommand;
import cv.igrp.fatura.compra.application.commands.CreateFaturaCompraCommand;
import cv.igrp.fatura.compra.application.commands.UpdateFaturaCompraCommand;
import cv.igrp.fatura.compra.application.dto.FaturaCompraCreateDTO;
import cv.igrp.fatura.compra.infrastructure.persistence.entity.FaturaCompraEntity;
import cv.igrp.fatura.compra.infrastructure.persistence.repository.FaturaCompraRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@IgrpController
@RestController
@RequestMapping(value = "api/v1/faturas-compra", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "FaturaCompra", description = "Gestão de faturas de compra")
public class FaturaCompraController {

    private static final Logger LOGGER = LoggerFactory.getLogger(FaturaCompraController.class);

    private final CommandBus commandBus;
    private final FaturaCompraRepository faturaCompraRepo;

    @GetMapping
    @Operation(summary = "Listar faturas de compra")
    @ApiResponse(responseCode = "200", description = "Lista paginada de faturas")
    public ResponseEntity<Page<FaturaCompraEntity>> list(
            @RequestParam(required = false) String estado,
            Pageable pageable) {
        if (estado != null && !estado.isBlank()) {
            return ResponseEntity.ok(faturaCompraRepo.findByEstado(estado, pageable));
        }
        return ResponseEntity.ok(faturaCompraRepo.findAllFetch(pageable));
    }

    @PostMapping
    @Operation(summary = "Criar fatura de compra")
    @ApiResponse(responseCode = "200", description = "Fatura criada com sucesso")
    @ApiResponse(responseCode = "400", description = "Dados inválidos ou campo obrigatório ausente")
    @ApiResponse(responseCode = "404", description = "Fornecedor, tipo de fatura ou série não encontrado")
    @ApiResponse(responseCode = "422", description = "Regra de negócio violada (ex: data vencimento < data faturação)")
    public ResponseEntity<FaturaCompraEntity> create(@RequestBody @Valid FaturaCompraCreateDTO dto) {
        LOGGER.info("[DEBUG] POST /faturas-compra — body recebido: {}", dto);
        return commandBus.send(new CreateFaturaCompraCommand(dto));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter fatura de compra por ID")
    @ApiResponse(responseCode = "200", description = "Fatura encontrada")
    @ApiResponse(responseCode = "404", description = "Fatura não encontrada")
    public ResponseEntity<FaturaCompraEntity> getById(@PathVariable Integer id) {
        return faturaCompraRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar fatura de compra (apenas RASCUNHO)")
    @ApiResponse(responseCode = "200", description = "Fatura atualizada com sucesso")
    @ApiResponse(responseCode = "400", description = "Dados inválidos ou campo obrigatório ausente")
    @ApiResponse(responseCode = "404", description = "Fatura ou fornecedor não encontrado")
    @ApiResponse(responseCode = "422", description = "Fatura não está em RASCUNHO ou regra de negócio violada")
    public ResponseEntity<FaturaCompraEntity> update(@PathVariable Integer id,
                                                     @RequestBody @Valid FaturaCompraCreateDTO dto) {
        return commandBus.send(new UpdateFaturaCompraCommand(id, dto));
    }

    @PutMapping("/{id}/confirmar")
    @Operation(summary = "Confirmar fatura de compra")
    @ApiResponse(responseCode = "200", description = "Fatura confirmada com sucesso")
    @ApiResponse(responseCode = "404", description = "Fatura não encontrada")
    @ApiResponse(responseCode = "422", description = "Fatura não pode ser confirmada no estado atual")
    public ResponseEntity<FaturaCompraEntity> confirmar(@PathVariable Integer id) {
        return commandBus.send(new ConfirmarFaturaCompraCommand(id));
    }

    @PutMapping("/{id}/anular")
    @Operation(summary = "Anular fatura de compra")
    @ApiResponse(responseCode = "200", description = "Fatura anulada com sucesso")
    @ApiResponse(responseCode = "404", description = "Fatura não encontrada")
    @ApiResponse(responseCode = "422", description = "Fatura não pode ser anulada no estado atual")
    public ResponseEntity<FaturaCompraEntity> anular(@PathVariable Integer id) {
        return commandBus.send(new AnularFaturaCompraCommand(id));
    }
}
