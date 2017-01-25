package com.thoughtworks.ddd.bootcamp;

import com.thoughtworks.domain.model.CartView;
import org.springframework.data.couchbase.repository.CouchbaseRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartQueryRepository extends CouchbaseRepository<CartView,String> {
}
