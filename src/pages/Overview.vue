<template>
<div>
  <PoolStats />
    <div class="row">
      <div class="col-12">
        <card :title="table1.title">
          <div class="table-responsive">
            <base-table :data="table1.tableData"
                        :columns="table1.columns"
                        thead-classes="text-primary">
            </base-table>
          </div>
        </card>
      </div>
    </div>
</div>
</template>
<script>
import { BaseTable } from "@/components";
import PoolStats from "./overview/PoolStats"
import getNodeStatus from "@/scripts/transcoderPool"

const tableColumns = ["Address", "Region", "Capacity", "Pending", "Payout"];


export default {
  components: {
    BaseTable,
    PoolStats
  },
  data() {
    return {
      tableheader: {
        title: "Connected Transcoders",
        columns: [...tableColumns]
      }
    };
  },
  computed: {
      table1 () {
          return {
              title: this.tableheader.title,
              columns: this.tableheader.columns,
              tableData: this.$store.state.transcoders
          }
      }
  },
  created () {
    this.$store.dispatch("storeStatus")
    this.$store.dispatch("storeTranscoders")
       setInterval(() => {
                this.$store.dispatch("storeTranscoders")
            }, 30000)
  }
};
</script>
<style>

.center-img {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 20%;
}

</style>
