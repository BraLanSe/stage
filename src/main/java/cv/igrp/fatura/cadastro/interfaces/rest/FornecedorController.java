package cv.igrp.fatura.cadastro.interfaces.rest;

import cv.igrp.framework.stereotype.IgrpController;
import cv.igrp.fatura.cadastro.application.dto.FornecedorCreateDTO;
import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.FornecedorEntity;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.FornecedorRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrEnquadramentoRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@IgrpController
@RestController
@RequestMapping(value = "api/v1/fornecedores", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Fornecedores", description = "Gestão de fornecedores")
public class FornecedorController {

    private final FornecedorRepository fornecedorRepo;
    private final PrEnquadramentoRepository prEnquadramentoRepo;

    @GetMapping
    @Operation(summary = "Listar todos os fornecedores")
    public ResponseEntity<Page<FornecedorEntity>> listAll(Pageable pageable) {
        return ResponseEntity.ok(fornecedorRepo.findAll(pageable));
    }

    @PostMapping
    @Operation(summary = "Criar fornecedor")
    public ResponseEntity<FornecedorEntity> create(@RequestBody @Valid FornecedorCreateDTO dto) {
        FornecedorEntity entity = new FornecedorEntity();
        entity.setCodigo(dto.getCodigo());
        entity.setDesig(dto.getDesig());
        entity.setDescr(dto.getDescr());
        entity.setIndColetivo(dto.getIndColetivo() != null ? dto.getIndColetivo() : false);
        entity.setNif(dto.getNif());
        entity.setNumCliente(dto.getNumCliente());
        entity.setEmail(dto.getEmail());
        entity.setTelefone(dto.getTelefone());
        entity.setGeografiaId(dto.getGeografiaId());
        entity.setPais(dto.getPais());
        entity.setEndereco(dto.getEndereco());
        entity.setPessoaContacto(dto.getPessoaContacto());
        entity.setAplicarImpostos(dto.getAplicarImpostos() != null ? dto.getAplicarImpostos() : true);
        entity.setMotivoNaoAplicarImposto(dto.getMotivoNaoAplicarImposto());
        entity.setContaGlId(dto.getContaGlId());
        if (dto.getEstado() != null) entity.setEstado(dto.getEstado());
        if (dto.getPrEnquadramentoId() != null) {
            prEnquadramentoRepo.findById(dto.getPrEnquadramentoId()).ifPresent(entity::setPrEnquadramento);
        }
        return ResponseEntity.ok(fornecedorRepo.save(entity));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter fornecedor por ID")
    public ResponseEntity<FornecedorEntity> getById(@PathVariable Integer id) {
        return fornecedorRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar fornecedor")
    public ResponseEntity<FornecedorEntity> update(@PathVariable Integer id, @RequestBody @Valid FornecedorCreateDTO dto) {
        return fornecedorRepo.findById(id).map(entity -> {
            entity.setCodigo(dto.getCodigo());
            entity.setDesig(dto.getDesig());
            entity.setDescr(dto.getDescr());
            entity.setIndColetivo(dto.getIndColetivo() != null ? dto.getIndColetivo() : entity.getIndColetivo());
            entity.setNif(dto.getNif());
            entity.setNumCliente(dto.getNumCliente());
            entity.setEmail(dto.getEmail());
            entity.setTelefone(dto.getTelefone());
            entity.setGeografiaId(dto.getGeografiaId());
            entity.setPais(dto.getPais());
            entity.setEndereco(dto.getEndereco());
            entity.setPessoaContacto(dto.getPessoaContacto());
            entity.setAplicarImpostos(dto.getAplicarImpostos() != null ? dto.getAplicarImpostos() : entity.getAplicarImpostos());
            entity.setMotivoNaoAplicarImposto(dto.getMotivoNaoAplicarImposto());
            entity.setContaGlId(dto.getContaGlId());
            if (dto.getEstado() != null) entity.setEstado(dto.getEstado());
            if (dto.getPrEnquadramentoId() != null) {
                prEnquadramentoRepo.findById(dto.getPrEnquadramentoId()).ifPresent(entity::setPrEnquadramento);
            }
            return ResponseEntity.ok(fornecedorRepo.save(entity));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar fornecedor")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!fornecedorRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        fornecedorRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
