<template>
  <FdpgLabel required size="medium" html-for="proposal.detailsOfTheInstitutionFacility" />
  <el-card class="form-group form-group-mb-40">
    <FdpgFormItem :prop="`${identifier}.institute.miiLocation`">
      <FdpgLabel html-for="proposal.selectionOfMiiLocation" />
      <FdpgSelect
        v-model="institute.miiLocation"
        :data-testId="`${identifier}.institute.miiLocation`"
        placeholder="proposal.countryPlaceholder"
        filterable
        :options="locationOptions"
        :disabled="reviewMode || institute.isDone || readonly"
      />
    </FdpgFormItem>
  </el-card>
  <el-card v-if="!institute.miiLocation && !readonly" class="form-group form-group-mb-40">
    <el-row :gutter="20">
      <el-col :sm="24">
        <FdpgFormItem :prop="identifier ? `${identifier}.institute.name` : 'institute.name'" :rules="formRules.name">
          <FdpgLabel html-for="proposal.fullCorrectNameOfTheInstitutionFacilityJurPerson" />
          <FdpgInput
            v-model="institute.name"
            :data-testId="`${identifier}.institute.name`"
            placeholder="proposal.pleaseEnterTheFullCorrectNameOfTheInstitutionFacilityJurPerson"
            :disabled="reviewMode || institute.isDone"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24" :md="12">
        <FdpgFormItem
          :prop="identifier ? `${identifier}.institute.streetAddress` : 'institute.streetAddress'"
          :rules="formRules.streetAddress"
        >
          <FdpgLabel html-for="proposal.street" />
          <FdpgInput
            v-model="institute.streetAddress"
            :data-testId="`${identifier}.institute.streetAddress`"
            placeholder="proposal.pleaseEnterTheStreet"
            :disabled="reviewMode || institute.isDone"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24" :md="12">
        <FdpgFormItem
          :prop="identifier ? `${identifier}.institute.houseNumber` : 'institute.houseNumber'"
          :rules="formRules.houseNumber"
        >
          <FdpgLabel html-for="proposal.houseNumber" />
          <FdpgInput
            v-model="institute.houseNumber"
            :data-testId="`${identifier}.institute.houseNumber`"
            placeholder="proposal.pleaseEnterTheHouseNumber"
            :disabled="reviewMode || institute.isDone"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24" :md="12">
        <FdpgFormItem
          :prop="identifier ? `${identifier}.institute.postalCode` : 'institute.postalCode'"
          :rules="formRules.postalCode"
        >
          <FdpgLabel html-for="proposal.postalCode" />
          <FdpgInput
            v-model="institute.postalCode"
            :data-testId="`${identifier}.institute.postalCode`"
            placeholder="proposal.pleaseEnterThePostalCode"
            :disabled="reviewMode || institute.isDone"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24" :md="12">
        <FdpgFormItem :prop="identifier ? `${identifier}.institute.city` : 'institute.city'" :rules="formRules.city">
          <FdpgLabel html-for="proposal.city" />
          <FdpgInput
            v-model="institute.city"
            :data-testId="`${identifier}.institute.city`"
            placeholder="proposal.cityPlaceholder"
            :disabled="reviewMode || institute.isDone"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24" :md="12">
        <FdpgFormItem
          :prop="identifier ? `${identifier}.institute.country` : 'institute.country'"
          :rules="formRules.country"
        >
          <FdpgLabel html-for="proposal.location" />
          <FdpgSelect
            v-model="institute.country"
            :data-testId="`${identifier}.institute.country`"
            :test-id-extension="'__' + identifier"
            placeholder="proposal.countryPlaceholder"
            filterable
            :options="countryOptions(t)"
            :disabled="reviewMode || institute.isDone"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24" :md="12">
        <FdpgFormItem :prop="identifier ? `${identifier}.institute.email` : 'institute.email'" :rules="formRules.email">
          <FdpgLabel html-for="proposal.emailAddress" />
          <FdpgInput
            v-model="institute.email"
            :data-testId="`${identifier}.institute.email`"
            placeholder="proposal.pleaseEnterTheEmailAddress"
            :disabled="reviewMode || institute.isDone"
          />
        </FdpgFormItem>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgInput from '@/components/FdpgInput.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import type { SelectOption } from '@/components/FdpgSelect.vue'
import FdpgSelect from '@/components/FdpgSelect.vue'
import { countryOptions } from '@/constants'
import type { ILocation } from '@/types/location.types'
import type { IInstitute } from '@/types/proposal.types'
import { emailValidationFunc, maxLengthValidationFunc, requiredValidationFunc } from '@/validations'
import { useVModel } from '@vueuse/core'
import type { FormInstance } from 'element-plus'
import type { PropType } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: {
    type: Object as PropType<IInstitute>,
    required: true,
  },

  formRef: {
    type: Object as PropType<FormInstance>,
    required: false,
    default: () => undefined,
  },

  reviewMode: {
    type: Boolean,
    default: false,
  },

  identifier: {
    type: String,
    required: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },

  locations: {
    type: Array as PropType<ILocation[]>,
    required: true,
    default: [],
  },
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

const locationOptions = [
  {
    label: t('proposal.otherOrganization'),
    value: undefined,
  } as SelectOption,
  ...props.locations.map((loc) => ({ label: loc.display, value: loc._id })),
]

const institute = useVModel(props, 'modelValue', emit)

const formRules = {
  name: [requiredValidationFunc('string'), maxLengthValidationFunc(1000)],
  streetAddress: [requiredValidationFunc('string'), maxLengthValidationFunc(500)],
  houseNumber: [requiredValidationFunc('string'), maxLengthValidationFunc(25)],
  postalCode: requiredValidationFunc(),
  city: [requiredValidationFunc('string'), maxLengthValidationFunc(250)],
  country: requiredValidationFunc(),
  email: [requiredValidationFunc('string'), emailValidationFunc(), maxLengthValidationFunc(500)],
}
</script>
