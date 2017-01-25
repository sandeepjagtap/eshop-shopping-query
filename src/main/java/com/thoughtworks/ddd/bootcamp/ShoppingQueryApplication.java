package com.thoughtworks.ddd.bootcamp;

import com.rabbitmq.client.Channel;
import com.thoughtworks.domain.event.CartInitializedEvent;
import com.thoughtworks.domain.event.ItemAddedEvent;
import com.thoughtworks.domain.model.CartView;
import com.thoughtworks.domain.model.Item;
import org.apache.log4j.Logger;
import org.axonframework.amqp.eventhandling.DefaultAMQPMessageConverter;
import org.axonframework.amqp.eventhandling.spring.SpringAMQPMessageSource;
import org.axonframework.config.ProcessingGroup;
import org.axonframework.eventhandling.EventHandler;
import org.axonframework.serialization.Serializer;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.couchbase.config.AbstractCouchbaseConfiguration;
import org.springframework.data.couchbase.repository.config.EnableCouchbaseRepositories;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@SpringBootApplication
@EnableCouchbaseRepositories(basePackageClasses = {CartQueryRepository.class})
@ComponentScan(basePackageClasses = {CartViewAPI.class})

public class ShoppingQueryApplication extends AbstractCouchbaseConfiguration {

    static Logger logger = Logger.getLogger(ShoppingQueryApplication.class);


    public static void main(String[] args) {
        SpringApplication.run(ShoppingQueryApplication.class, args);
    }

    @Override
    protected List<String> getBootstrapHosts() {
        return Collections.singletonList("127.0.0.1");
    }

    @Override
    protected String getBucketName() {
        return "carts";
    }

    @Override
    protected String getBucketPassword() {
        return "";
    }

    @Component
    @ProcessingGroup("shopping-query")
    public static class CartViewUpdater {

        private final CartQueryRepository repository;

        public CartViewUpdater(CartQueryRepository repository) {
            this.repository = repository;

        }

        @EventHandler
        public void handle(CartInitializedEvent event) {
            repository.save(new CartView(event.getId()));
        }

        @EventHandler
        public void handle(ItemAddedEvent event) {
            CartView cartView = repository.findOne(event.getCartId());
            cartView.add(new Item(event.getItemId(), event.getQuantity()));
            repository.save(cartView);
        }

    }

    @Bean
    public SpringAMQPMessageSource cartSource(Serializer serlializer) {

        return new SpringAMQPMessageSource(new DefaultAMQPMessageConverter(serlializer)) {

            @RabbitListener(queues = "CartEvents")
            public void onMessage(Message message, Channel channel) throws Exception {
                super.onMessage(message, channel);
            }
        };
    }

    @Bean
    public Exchange exchange() {
        return ExchangeBuilder.fanoutExchange("appFanoutExchange").build();
    }

    @Bean
    public Queue queue() {
        return QueueBuilder.durable("CartEvents").build();
    }

    @Bean
    public Binding binding() {
        return BindingBuilder.bind(queue()).to(exchange()).with("*").noargs();
    }

    @Autowired
    public void configure(AmqpAdmin admin) {
        admin.declareQueue(queue());
        admin.declareBinding(binding());
    }

}
