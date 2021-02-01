package com.kbkn.coronawarnappscannersetup

import android.graphics.Rect
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.recyclerview.widget.DividerItemDecoration
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.kbkn.coronawarnappscannersetup.adapters.ScannerAdapter
import com.kbkn.coronawarnappscannersetup.databinding.ScannerListFragmentBinding
import com.kbkn.coronawarnappscannersetup.viewmodels.ScannerListViewModel
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class ScannerListFragment : Fragment() {
    private val scannerListViewModel: ScannerListViewModel by viewModels()

    lateinit var adapter: ScannerAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        val binding = ScannerListFragmentBinding.inflate(inflater, container, false)
        context ?: return binding.root

        val orientation = (binding.scannerList.layoutManager as LinearLayoutManager).orientation
        binding.scannerList.addItemDecoration(
            DividerItemDecoration(binding.scannerList.context, orientation).apply {
                this.setDrawable(ContextCompat.getDrawable(
                    binding.scannerList.context,
                    R.drawable.invisible_divider_spacer
                )!!)
            }
        )
                adapter = ScannerAdapter { scannerListViewModel.onClick(it) }
        binding.scannerList.adapter = adapter
        binding.viewModel = scannerListViewModel
        subscribeUi(adapter)

        return binding.root
    }

    private fun subscribeUi(adapter: ScannerAdapter) {
        scannerListViewModel.scannerList.observe(viewLifecycleOwner) {
            adapter.submitList(it)
        }
    }
}