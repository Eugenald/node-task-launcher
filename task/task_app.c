#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main(int argc, char *argv[]) {
    srand((unsigned int)time(NULL));
    int result = rand() % 3;

    if (result == 0) {
        return 0;
    } else if (result == 1) {
        return 1;
    } else {
        int *p = NULL;
        *p = 42;
        return 42;
    }
}
