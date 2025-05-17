fn main(x: Field, y: pub Field) {
    //x = hash salvo no servidor
    //y = hash a ser comparado
    assert(x == y);
}

#[test]
fn test_main() {
    main(1, 2);

    // Uncomment to make test fail
    // main(1, 1);
}
