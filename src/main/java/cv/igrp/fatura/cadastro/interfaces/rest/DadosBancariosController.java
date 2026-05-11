package cv.igrp.fatura.cadastro.interfaces.rest;

import cv.igrp.fatura.cadastro.application.dto.DadosBancariosDTO;
import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.DadosBancariosEntity;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.DadosBancariosRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dados-bancarios")
@RequiredArgsConstructor
@Tag(name = "Dados Bancários", description = "Gestão dos dados bancários da empresa")
public class DadosBancariosController {

    private final DadosBancariosRepository dadosBancariosRepo;

    @GetMapping
    @Operation(summary = "Listar dados bancários")
    public List<DadosBancariosEntity> listar() {
        return dadosBancariosRepo.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter dados bancários por ID")
    public ResponseEntity<DadosBancariosEntity> obter(@PathVariable Integer id) {
        return dadosBancariosRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Criar dados bancários")
    public ResponseEntity<DadosBancariosEntity> criar(@RequestBody DadosBancariosDTO dto) {
        DadosBancariosEntity entity = new DadosBancariosEntity();
        toEntity(dto, entity);
        return ResponseEntity.ok(dadosBancariosRepo.save(entity));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar dados bancários")
    public ResponseEntity<DadosBancariosEntity> atualizar(
            @PathVariable Integer id, @RequestBody DadosBancariosDTO dto) {
        return dadosBancariosRepo.findById(id).map(entity -> {
            toEntity(dto, entity);
            return ResponseEntity.ok(dadosBancariosRepo.save(entity));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remover dados bancários")
    public ResponseEntity<Void> remover(@PathVariable Integer id) {
        if (!dadosBancariosRepo.existsById(id)) return ResponseEntity.notFound().build();
        dadosBancariosRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private static void toEntity(DadosBancariosDTO dto, DadosBancariosEntity entity) {
        entity.setBanco(dto.getBanco());
        entity.setNib(dto.getNib());
        entity.setIban(dto.getIban());
        entity.setSwift(dto.getSwift());
        entity.setTitular(dto.getTitular());
        if (dto.getEstado() != null) entity.setEstado(dto.getEstado());
    }
}
