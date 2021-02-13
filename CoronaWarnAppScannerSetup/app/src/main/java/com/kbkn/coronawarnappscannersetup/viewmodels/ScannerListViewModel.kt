package com.kbkn.coronawarnappscannersetup.viewmodels


import android.bluetooth.le.ScanResult
import android.util.Log
import androidx.databinding.ObservableBoolean
import androidx.hilt.lifecycle.ViewModelInject
import androidx.lifecycle.*
import com.kbkn.coronawarnappscannersetup.data.ScannerRepository
import com.kbkn.coronawarnappscannersetup.data.ScannerList
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.collect

class ScannerListViewModel @ViewModelInject constructor(
    val repository: ScannerRepository,
) :ViewModel() {
    var scannerList: LiveData<List<ScanResult>> = repository.fetchScannerFlow().asLiveData()

    var isLoading = ObservableBoolean(false)

    fun onRefresh() {
        val scope = CoroutineScope(Job() + Dispatchers.Main)
        Log.i("Swipe","Refreshing")
        isLoading.set(true)
        scope.launch {
            repository.updateScannerFlow {isLoading.set(false)}
        }

    }

    fun onClick(scanResult: ScanResult) {
        repository.sendPosition(scanResult)
    }
}