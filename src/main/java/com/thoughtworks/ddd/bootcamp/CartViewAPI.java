package com.thoughtworks.ddd.bootcamp;

import com.thoughtworks.domain.model.CartView;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/cart")
public class CartViewAPI {

    private CartQueryRepository repository;

    public CartViewAPI(CartQueryRepository repository) {
        this.repository = repository;
    }

    @GetMapping(path="/{id}")
    public CartView get(@PathVariable String id) {
        return repository.findOne(id);
    }
}
