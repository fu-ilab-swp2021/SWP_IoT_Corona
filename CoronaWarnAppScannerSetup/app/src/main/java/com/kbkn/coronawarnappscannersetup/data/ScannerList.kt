package com.kbkn.coronawarnappscannersetup.data

enum class ListState {
    LOADING,
    WAITING,
    LOADED,
}

data class ScannerList (
    var scannerList: List<Scanner>,
    var state: ListState,
        )