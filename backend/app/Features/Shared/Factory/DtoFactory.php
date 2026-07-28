<?php

namespace App\Features\Shared\Factory;

class DtoFactory
{
    /**
     * Create a DTO from the given data and class name.
     *
     * @template T of object
     *
     * @param  class-string<T>  $dtoClass
     * @param  array<string, mixed>  $data
     * @return T
     */
    public static function make(string $dtoClass, array $data): object
    {
        return $dtoClass::fromArray($data);
    }
}
