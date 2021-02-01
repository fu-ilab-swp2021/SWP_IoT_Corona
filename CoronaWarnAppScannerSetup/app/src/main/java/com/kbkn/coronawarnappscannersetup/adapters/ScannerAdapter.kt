package com.kbkn.coronawarnappscannersetup.adapters

import android.bluetooth.le.ScanResult
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.ViewModelStoreOwner
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.kbkn.coronawarnappscannersetup.databinding.ListItemScannerBinding
import com.kbkn.coronawarnappscannersetup.viewmodels.ScannerListViewModel
import javax.inject.Inject


class ScannerAdapter constructor(
    private val listener: (ScanResult) -> Unit
):  ListAdapter<ScanResult, RecyclerView.ViewHolder>(ScannerDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return ScannerViewHolder(
            ListItemScannerBinding.inflate(
                LayoutInflater.from(parent.context),
                parent,
                false,
            )
        )
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val scanner = getItem(position)
        (holder as ScannerViewHolder).bind(scanner, listener)
    }

    class ScannerViewHolder(
        private val binding: ListItemScannerBinding
    ) : RecyclerView.ViewHolder(binding.root) {
        fun bind(item: ScanResult, listener: (ScanResult) -> Unit) {
            binding.apply {
                scanner = item
                clickListener = View.OnClickListener { listener(item) }
                executePendingBindings()
            }
        }
    }

}
private class ScannerDiffCallback : DiffUtil.ItemCallback<ScanResult>() {
    override fun areItemsTheSame(oldItem: ScanResult, newItem: ScanResult): Boolean {
        return oldItem.rssi == newItem.rssi;
    }

    override fun areContentsTheSame(oldItem: ScanResult, newItem: ScanResult): Boolean {
        return oldItem == newItem
    }

}