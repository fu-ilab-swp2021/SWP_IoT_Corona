package com.kbkn.coronawarnappscannersetup.data

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.bluetooth.*
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanResult
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.PermissionInfo
import android.location.Location
import android.location.LocationManager
import android.os.Looper
import android.util.Log
import android.widget.Toast
import androidx.core.app.ActivityCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.tasks.Tasks
import dagger.hilt.android.qualifiers.ActivityContext
import dagger.hilt.android.scopes.ActivityScoped
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.util.*
import javax.inject.Inject
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine

@ActivityScoped
class ScannerRepository @Inject constructor(
    @ActivityContext private val context: Context
) {
    private val baseBluetoothUuidPostfix = "0000-1000-8000-00805F9B34FB"
    // uuids for finding a device
    /* service uuid for device information */
    private val GATT_DEVICE_INFO_UUID = uuidFromShortCode16("180A")
    /* characteristic uuids */
    private val GATT_MANUFACTURER_NAME_UUID = uuidFromShortCode16("2A29")
    private val GATT_MODEL_NUMBER_UUID = uuidFromShortCode16("2A24")

    /* service uuid for device location */
    private val GATT_LOCATION_UUID = uuidFromShortCode16("1819")
    /* characteristic uuids */
    private val GATT_LATITUDE_UUID = uuidFromShortCode16("2AAE")
    private val GATT_LONGITUDE_UUID = uuidFromShortCode16("2AAF")

    private val DEV_NAME = "CWA Scanner"

    private lateinit var location: Location

    private val REQUEST_ENABLE_BT = 13426
    private val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
    private val bluetoothAdapter = bluetoothManager.adapter
    @ExperimentalCoroutinesApi
    private val _scannerFlow: MutableStateFlow<List<ScanResult>> = MutableStateFlow(listOf<ScanResult>())

    init {
        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled) {
            val enableBtIntent = Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE)
            (context as Activity).startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT);
        }
        setLocation()
    }

    @ExperimentalCoroutinesApi
    fun fetchScannerFlow(): StateFlow<List<ScanResult>> {
        updateScannerFlow{}
        return _scannerFlow
    }

        fun sendPosition(scanResult: ScanResult) {
            CoroutineScope(Dispatchers.IO).launch {
                val latitude = location.latitude.toByteArray()
                val longitude = location.longitude.toByteArray()
                Log.d("scanner repo","lat: ${location?.latitude}, lon: ${location?.longitude}")
                withContext(Dispatchers.Main) {
                    writePosition(scanResult.device, GATT_LATITUDE_UUID!!, latitude)
                    delay(1000)
                    writePosition(scanResult.device, GATT_LONGITUDE_UUID!!, longitude)
                }
            }
        }

        private suspend fun writePosition(device: BluetoothDevice, location: UUID, value: ByteArray) =
            suspendCoroutine<Unit>{ cont ->
                device.connectGatt(context, false, object: BluetoothGattCallback() {
                    override fun onConnectionStateChange(gatt: BluetoothGatt?, status: Int, newState: Int) {
                        if (newState==BluetoothProfile.STATE_CONNECTED) {
                            gatt?.discoverServices()
                        }
                    }
                    override fun onServicesDiscovered(gatt: BluetoothGatt?, status: Int) {
                        if (gatt?.services?.map { s -> s.uuid }?.contains(GATT_LOCATION_UUID) == true) {
                            val service = gatt.getService(GATT_LOCATION_UUID)
                            val char = service.getCharacteristic(location)
                            char.value = value
                            gatt.writeCharacteristic(char)
                            cont.resume(Unit)
                        }
                    }
                })
            }

        // Using https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/callback-flow.html
        // to find out the model and manufacturer asynchronously
        @ExperimentalCoroutinesApi
        private fun Flow<ScanResult>.isCWAScanner(): Flow<ScanResult> = transform { sr ->

        }

        private fun Double.toByteArray(): ByteArray {
            return ByteBuffer.wrap(ByteArray(8))
                .apply { this.order(ByteOrder.LITTLE_ENDIAN) }.putDouble(this).array().apply {
                    Log.i("scanner repo","endian: ${Arrays.toString(this)}")
                }
        }

        private fun uuidFromShortCode16(shortCode16: String): UUID? {
            return UUID.fromString("0000$shortCode16-$baseBluetoothUuidPostfix")
        }

        private fun uuidFromShortCode32(shortCode32: String): UUID? {
            return UUID.fromString("$shortCode32-$baseBluetoothUuidPostfix")
        }

        @SuppressLint("VisibleForTests")
        private fun setLocation() {
            if (ActivityCompat.checkSelfPermission(
                    context,
                    Manifest.permission.ACCESS_FINE_LOCATION
                ) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(
                    context,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                ActivityCompat.requestPermissions(
                    context as Activity,
                    arrayOf(
                        Manifest.permission.ACCESS_FINE_LOCATION,
                        Manifest.permission.ACCESS_COARSE_LOCATION)
                    ,0)
                // TODO: Consider calling
                //    ActivityCompat#requestPermissions
                // here to request the missing permissions, and then overriding
                //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
                //                                          int[] grantResults)
                // to handle the case where the user grants the permission. See the documentation
                // for ActivityCompat#requestPermissions for more details.
            }

            CoroutineScope(Dispatchers.Default).launch {
                suspendCoroutine<Location> { cont ->
                    val locationClient = FusedLocationProviderClient(context)
                    val current = Tasks.await(locationClient.lastLocation)
                    Looper.prepare()
                    if (current == null) {
                        Toast.makeText(context, "No cached Location using 1,0 1,0", Toast.LENGTH_SHORT)
                    }
                    location = current
                    Toast.makeText(context, "Location is lat: ${location.latitude}, lon; ${location.longitude}", Toast.LENGTH_SHORT)
                }
            }
        }


        @ExperimentalCoroutinesApi
        fun updateScannerFlow(finishCallback: (() -> Unit)) {
            CoroutineScope(Dispatchers.Main).launch {
                val resultList: MutableList<ScanResult> = mutableListOf()
                val callback = object : ScanCallback() {
                    override fun onScanResult(callbackType: Int, result: ScanResult?) {
                        if (result!=null && result.device?.name?.equals(DEV_NAME) == true) {
                            if (!resultList.map { it.rssi }.contains(result.rssi)) {
                                resultList.add(result)
                                _scannerFlow.value = resultList
                            }
                        }
                    }
                }
                bluetoothAdapter.bluetoothLeScanner.startScan(callback)
                delay(4000)
                bluetoothAdapter.bluetoothLeScanner.stopScan(callback)
                finishCallback()
            }
        }
}